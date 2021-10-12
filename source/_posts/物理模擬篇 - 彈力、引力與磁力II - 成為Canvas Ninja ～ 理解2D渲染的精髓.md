---
title: Day17 - 物理模擬篇 - 彈力、引力與磁力II - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

在上一篇文中我們提到了`一維彈力模擬`的案例

這次我們則是要實作`二維彈力模擬`～並且是存在`重力場`的狀態!

原則上原理是不會有太大的差異，我們這邊再**複習**一下模擬程序`1幀`內的**邏輯流程**:

- 在每次`RAF`更新畫面的時候，首先先清掉畫布
- 重新描繪`球`和`彈簧`的位置
- 依據`加速度`更新`球`的`速度`數據
- 根據`球`的位置更新`彈力`的向量
- 計算`阻力`，最後和`彈力`向量相加，取得`受力`（optional）
- 根據`受力`來更新`球`的`加速度`數據
- 進到下一圈`RAF`

# 二維彈性模擬

下面這張圖就是我們這次要模擬的案例～

![img](https://i.imgur.com/tsJvbW6.png?1)

畫面中球跟球之間是藉由`彈力線`做串連;操作者可以拉動畫面中的`任何一顆球`，整條`彈力鏈` 就會被拖動。

比較需要注意的是這次我們加入了`重力場`的計算，這意味著在`受力`計算的階段，我們還要另外加上`重力`。

除此之外，由於這次球的運動方向是`二維`的，所以就會有`水平`、`垂直`方向的`受力`運算：

水平方向:會因爲使用者拖曳球的`角度`，而導致斜向`彈力`的出現，除此之外我們這次也會加入`風阻`的計算，這也會對`水平方向`受力造成影響。

垂直方向:基本上`垂直方向`除了會跟水平方向一樣受到`彈力`、`阻力`的影響外，還會有我們剛剛提到的`重力`。

> 由於這次的案例也有點小複雜，所以我也一樣會把案例分成兩次來講解，並且我也會使用webpack 搭配 esModule  來進行案例的實作～

這次我們還是先從場景的搭建開始~

```` javascript

const CANVAS = {
  width: 800,
  height: 600,
  background: 'gray'
}

const BALL = {
  radius: 5,
  color: 'white'
}

const CORDS = [
  {
    length: 100,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
  {
    length: 30,
    elasticConst: 100,
  },
]



const GRAVITY = 9.8;



const BALL_MASS_CONST = 0.01;

class Ball {
  constructor(x, y, radius, color, fixed) {
    this.radius = radius;
    this.mass = BALL_MASS_CONST * radius;
    this.color = color;
    this.fixed = fixed; //球是否固定在當前空間中 

    this.x = x;
    this.y = y;
    this.velocity = new Vector2D(0, 0);
    this.force = new Vector2D(0, 0)
    this.acc = new Vector2D(0, 0);
  }

  // 這次我們給球的class 新增這一個方法。用途是用來計算與另外一顆球的距離向量(不含兩顆球的半徑)
  distBetween(ball) {
    const dx = ball.x - this.x;
    const dy = ball.y - this.y;
    const vectorBetween = new Vector2D(dx, dy);
    const lengthAlpha = vectorBetween.length();
    const length = vectorBetween.length() - this.radius - ball.radius;
    const lengthVector = vectorBetween.para(length / lengthAlpha);
    return lengthVector;
  }

  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// 這次的我們沒有要用之前寫的Spring ，而是新增了Cord(弦)這個類，弦在初始化的時候必須要傳入兩個Ball的實例，還有弦的原始長度、弦的彈性係數
class Cord {
  constructor(ballFormer, ballLatter, cordLength, elasticConst, cordWidth = 1, color = '#555') {
    this.ballFormer = ballFormer; //上面端點的球
    this.ballLatter = ballLatter;//下面端點的球
    this.cordLength = cordLength;  // 原始長度
    this.elasticConst = elasticConst;   //彈性係數
    this.cordWidth = cordWidth;
    this.color = color;
  }

  lengthVector() {
    return this.ballFormer.distBetween(this.ballLatter);
  }

  calcForce() {
    const deltaLength = this.lengthVector().length - this.cordLength; // 變形量
    const deltaLengthVector = this.lengthVector.para(deltaLength / this.lengthVector().length)// 變形量的向量
    this.force = deltaLengthVector.multiply(this.elasticConst); // 彈力的向量
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.ballFormer.x, this.ballFormer.y);
    ctx.lineTo(this.ballLatter.x, this.ballLatter.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.cordWidth;
    ctx.stroke();
    ctx.closePath();
  }

}

class Elastic2DCordAnimation {
  constructor(ctx) {
    this.ctx = ctx;
    this.cvs = ctx.canvas;
    this.balls = [];
    this.cords = [];
    this.frameIsPaused = false;
    // this.ballGrabbed;
    this.init();
  }
  // 入口方法
  init() {
    this.time = 0;
    this.setCanvasSize();
    this.initEvents();
    this.initEntities();
    this.animate();
  }
  // 把所有的實體(entity) 也就是弦和球都先做實例的初始化
  initEntities() {
    // init balls;
    for (let i = 0; i <= CORDS.length; i++) {
      const x = this.cvs.width / 2;
      let y = 0;
      const cordsBefore = CORDS.filter((cord, index) => {
        return index < i
      })
      // 依據每條弦的長短，總合出球的具體位置
      if (cordsBefore.length > 0) {
        y = cordsBefore.map(cord => cord.length).reduce((prev, next) => {
          return prev + next;
        })
      }
      // 最頂端，也就是連結天花板的部分也會被視為一顆球，但是這顆球半徑為0，而且會有『固定（fixed）』屬性
      this.balls.push(new Ball(x, y, i === 0 ? 0 : BALL.radius, BALL.color, i === 0))
    }

    // init cords
    for (let i = 0; i < CORDS.length; i++) {
      const cord = new Cord(this.balls[i], this.balls[i + 1], CORDS[i].length, CORDS[i].elasticConst)
      this.cords.push(cord);
    }

  }


  initEvents() {
    this.initVisibilityChangeEvent();
    // this.initMouseEvent();
  }

  initVisibilityChangeEvent() {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== "visible") {
        this.frameIsPaused = true;
      }
      else {
        this.frameIsPaused = false;
        this.time = performance.now();
      }
    });
  }

  setCanvasSize() {
    this.cvs.width = CANVAS.width;
    this.cvs.height = CANVAS.height;
    this.cvs.style.backgroundColor = CANVAS.background;
  }

  animate() {
    if (this.frameIsPaused) {
      this.animate();
    }
    const $this = this;
    const dt = (performance.now() - this.time) / 1000;
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.drawAll(dt);

    this.time = performance.now();
    requestAnimationFrame(this.animate.bind($this));
  }

  drawAll(dt) {
    // 把球和弦都個別畫出來
    this.cords.forEach((o, i) => {
      o.draw(this.ctx);
    })
    this.balls.forEach((o, i) => {
      o.draw(this.ctx);
    })
  }

}



document.addEventListener('DOMContentLoaded', () => {
  let ctx = document.querySelector('canvas').getContext('2d');
  let instance = new Elastic2DCordAnimation(ctx)
})
````
![img](https://i.imgur.com/dQckdIe.png?1)


到這邊我們就結束了初期場景與實體(Entity,也就是`弦`和`球`)的繪製，在下一篇我們就會進入正式的動畫階段~




