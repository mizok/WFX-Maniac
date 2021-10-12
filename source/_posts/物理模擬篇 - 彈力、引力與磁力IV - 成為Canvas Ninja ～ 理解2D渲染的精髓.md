---
title: Day20 - 物理模擬篇 - 彈力、引力與磁力IV - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

# 磁力/引力模擬

`彈力`、`磁力`和`引力`其實本質上很接近。

之所以說相近，是因為他們都是一種`長距離作用力`。  

`彈簧`在被壓縮的狀況下會產生`擴張`的力量，而在拉長的狀況下則會進行`收縮`;  

`引力`是指當兩個具有`質量`的東西存在於同一空間時，他們會有互相吸引的力量，這個力量也會跟距離呈`負相關`;  

最後`磁力`則是大家都知道的`同極相斥、異極相吸`。  

---

其實`磁力/引力`的部分我打算只用一個案例進行說明，畢竟性質相像。

下圖是這次案例的示意圖: 

![img](https://i.imgur.com/uK9CNyn.png)

首先，我們在這次的案例中可以用滑鼠移動去操作一個`磁鐵`，`磁鐵`本身的磁力具有`最大可影響範圍`，也就是我們在圖片中提到的`磁力圈`，而在空間中我們會擺放幾顆靜止的`小鐵球`，當滑鼠靠近`小鐵球`的時候，他們就會被吸進去`磁力圈`內部。

大致上是這樣的概念。

簡單錄了一段實作的影片：
https://www.youtube.com/watch?v=79zVYU905VY

Github Page: https://mizok.github.io/ithelp2021/magnet-animation.html

這個案例其實不怎麼難，我們馬上就來看試試：

````javascript
import { Vector2D } from '../class'

const CANVAS = {
  width: 800,
  height: 600,
  background: 'gray'
}

const BALLS = [
  {
    x: 300,
    y: 300,
    radius: 25,
    mass: 50,
  },
  {
    x: 380,
    y: 380,
    radius: 25,
    mass: 50,
  },
  {
    x: 375,
    y: 330,
    radius: 25,
    mass: 50,
  },
  {
    x: 200,
    y: 200,
    radius: 55,
    mass: 100,
  },
  {
    x: 250,
    y: 250,
    radius: 15,
    mass: 50,
  },
  {
    x: 450,
    y: 450,
    radius: 10,
    mass: 10,
  },
  {
    x: 600,
    y: 600,
    radius: 75,
    mass: 50,
  },
]

const getDist = (x0, y0, x1, y1) => {
  return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}

const MAGNET_SIZE = 500;

const MAGNET_FORCE_CONST = 7000;

class Circle {
  constructor(x, y, radius, fillColor = 'transparent', strokeColor = 'black', lineWidth = 1) {
    this.x = x;
    this.y = y;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.lineWidth = lineWidth;
    this.radius = radius;
  }
  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

class Ball extends Circle {
  constructor(x, y, radius, mass, fillColor = 'rgba(0,0,0,0.25)', strokeColor = 'transparent') {
    super(x, y, radius, fillColor, strokeColor);
    this.friction = 0.995;
    this.force = new Vector2D(0, 0);
    this.acc = new Vector2D(0, 0);
    this.velocity = new Vector2D(0, 0);
    this.mass = mass;
  }
  refreshLocation(dt) {
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }
  refreshSpeed(dt) {
    this.velocity.scaleBy(this.friction);
    this.velocity.incrementBy(this.acc.multiply(dt));
  }
}

class MagnetAnimation {
  constructor(ctx) {
    this.ctx = ctx;
    this.cvs = ctx.canvas;
    this.frameIsPaused = false;
    this.balls = [];
    this.mouse = {
      x: 0,
      y: 0
    }
    this.magnet = null
    this.init();
  }
  init() {
    this.time = performance.now();
    this.setCanvasSize();
    this.initEvents();
    this.initBalls();
    this.animate();
  }
  initBalls() {
    BALLS.forEach((o, i) => {
      const ball = new Ball(o.x, o.y, o.radius, o.mass);
      this.balls.push(ball);
    })
  }
  initEvents() {
    this.initVisibilityChangeEvent();
    this.initMouseEvent();
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
  initMouseEvent() {
    this.cvs.addEventListener('mousedown', () => {
      this.isClicked = true;
    })
    this.cvs.addEventListener('mousemove', (e) => {
      if (!this.isClicked) return;
      let rect = this.cvs.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    })
    this.cvs.addEventListener('mouseup', () => {
      console.log(this.balls);
      this.isClicked = false;
    })
    this.cvs.addEventListener('mouseleave', () => {
      this.isClicked = false;
    })
  }

  drawAll() {
    this.drawMagnet();
    this.drawBalls();
  }

  drawMagnet() {
    new Circle(this.mouse.x, this.mouse.y, MAGNET_SIZE / 2).draw(this.ctx);
  }

  drawBalls() {
    this.balls.forEach((o, i) => {
      o.draw(this.ctx);
    })
  }

  animate() {
    if (this.frameIsPaused) {
      this.animate();
    }
    const $this = this;
    const frameDelay = 10 // frameDelay 是用來做動畫抽幀的常數，可以想像成會讓動畫加速！
    const dt = (performance.now() - this.time) * frameDelay / 1000;
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.drawAll();
    this.refreshBallsLocation(dt);
    this.refreshBallsSpeed(dt);
    this.refreshBallsAcc();

    this.time = performance.now();
    requestAnimationFrame(this.animate.bind($this));
  }

  refreshBallsLocation(dt) {
    this.balls.forEach((o, i) => {
      o.refreshLocation(dt);
    })
  }

  refreshBallsSpeed(dt) {
    this.balls.forEach((o, i) => {
      o.refreshSpeed(dt);
    })
  }

  refreshBallsAcc() {
    this.balls.forEach((o, i) => {
      const distToMouse = getDist(this.mouse.x, this.mouse.y, o.x, o.y);
      if (distToMouse < MAGNET_SIZE / 2 + o.radius && distToMouse > 1e-2) {
        o.force = new Vector2D(this.mouse.x - o.x, this.mouse.y - o.y).para(MAGNET_FORCE_CONST / (distToMouse));
        o.acc = o.force.multiply(1 / o.mass);
      }
      else {
        o.force = new Vector2D(0, 0);
        o.acc = new Vector2D(0, 0);
      }
    })
  }

  setCanvasSize() {
    this.cvs.width = CANVAS.width;
    this.cvs.height = CANVAS.height;
    this.cvs.style.backgroundColor = CANVAS.background;
  }
}


(() => {
  let ctx = document.querySelector('canvas').getContext('2d');
  let instance = new MagnetAnimation(ctx);
})()
````

比較需要解釋的應該也就是受力計算的階段，我在這個部分使用的是 `MAGNET_FORCE_CONST / (distToMouse)` 去做磁力的運算。

在高中時期我們學到的公式其實長這樣:

![img](https://i.imgur.com/8aN8dqV.jpg)

> 圖片來自 <基本電學 - 台科大圖書股份有限公司出版>

在上圖中指出，磁力在現實生活中其實是和`距離的平方`成`反比`的，但是其實很多時候我們去看`canvas`的`物理模擬`案例，會發現運算的過程似乎跟理論不太一樣(我們是取`與距離成反比`的運算方法)。

通常這種情形有幾個`原因`：

- 我們做的是`動畫`，而不是`實驗`。動畫追求的是`戲劇效果`而不是物理上的`精確性`
- 要達成`實際理論`的計算可能會耗費較多的`瀏覽器資源`，所以需要作出取捨

當然我們這邊也可以改成『`取與距離平方成反比`』來做計算，但是我只是想要藉著這個機會提到這個問題。

在越複雜的案例其實越常有這種事發生，像是碰到有大量開根號或大量巢狀迴圈的計算。

有時候看源碼反而需要花更多時間去**理解運算的過程**，不能完全依賴書上寫的公式。

以上就是本次`磁力/引力`案例的實作～希望大家喜歡 :D








