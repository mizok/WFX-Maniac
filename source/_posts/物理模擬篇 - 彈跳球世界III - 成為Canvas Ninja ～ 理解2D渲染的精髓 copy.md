---
title: Day13 - 物理模擬篇 - 彈跳球世界IV - 成為Canvas Ninja ～ 理解2D渲染的精髓.md
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

終於來到彈跳球的最後一篇～ 這篇我們主要就是要講解`傾斜面`存在的狀況下，程式的撰寫方法!

老實說我原本是打算在一篇文內把`傾斜面`的範例處理完畢的。
但是因為碰上一些工作上的問題，時間有點不太夠用 :(

所以我還是把這部分拆成兩篇文來寫了(罰跪

也就是說~這一篇是`前篇`，我在這篇會先講解這個案例的大概樣貌，還有場景的架設要怎麼處理~

![img](https://i.imgur.com/FJiXlNs.png)

這邊就先來看看我構建場景的源碼~ 基本上因為這個案例偏複雜，所以我會使用`webpack`搭配`ESModule`來編寫這個案例。
之後完整案例的源碼我會貼在我自己的`public repo`上面，供各位看官查閱~

> 關於源碼中傾斜面碰撞偵測的原理可以看[之前的文](https://ithelp.ithome.com.tw/articles/10272754)喔

````javascript
// Vector2D 就是我們前面建立的向量類，
// 我這邊補了一個 Point2D類，用途是用來產生一個具有x和y property 的座標物件
import { Vector2D, Point2D } from './class';

const CANVAS = {
  width: 600,
  height: 600,
  background: 'gray'
}

const BALL = {
  radius: 5,
  color: '#333'
}

// 先用陣列描述六面牆壁的端點位置
const WALLS = [
  [new Point2D(50, 50), new Point2D(50, 550)],// 左邊界
  [new Point2D(550, 50), new Point2D(550, 550)],//右邊界
  [new Point2D(50, 550), new Point2D(550, 550)],//下邊界
  [new Point2D(125, 150), new Point2D(475, 100)],// 第一斜坡
  [new Point2D(75, 250), new Point2D(425, 300)],// 第二斜坡
  [new Point2D(125, 450), new Point2D(550, 400)]// 第三斜坡
]

// 這個是球的類，球本身會具有隨機性的初速，和向下的加速度，同時他會具備可以更新自身速度和位置的方法
class Ball {
  constructor(x, y, color = BALL.color, radius = BALL.radius, randomSpeed = true) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
    this.gravity = new Vector2D(0, 4);
    this.friction = 0.999;
    if (randomSpeed) {
      this.velocity = new Vector2D(
        (Math.random() * this.radius * 2 - radius) * 10,
        (Math.random() * this.radius * 2 - radius)
      )
    }
    else {
      this.velocity = new Vector2D(0, 0);
    }
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
  refreshLocation(dt) {
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;
  }
  refreshSpeed(dt) {
    this.velocity.scaleBy(this.friction);
    this.velocity.incrementBy(this.gravity.multiply(dt));
  }
}

// 這個是用來統合所有牆壁的類
class Boundary {
  constructor() {
    this.walls = WALLS;
  }

  draw(ctx) {
    this.walls.forEach((o, i) => {
      ctx.beginPath();
      ctx.moveTo(o[0].x, o[0].y);
      ctx.lineTo(o[1].x, o[1].y);
      ctx.closePath();
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'white';
      ctx.stroke();
    })
  }
}

// 這個是主要的入口
class InclinedWallsAndBouncingBallsAnimation {
  constructor(ctx) {
    this.ctx = ctx;
    this.cvs = ctx.canvas;
    // balls 是一個"球池"的概念，用來集中放置所有因爲滑鼠點擊而產生的球
    this.balls = [];
    this.frameIsPaused = false;
    //入口方法
    this.init();
  }

  init() {
    this.time = 0;
    // 動態決定canvas大小
    this.setCanvasSize();
    // 在初始的時候先繪製一次牆壁
    this.initBoundary();
    // 綁定滑鼠點擊事件和document的visibilityChange 事件
    this.initEvents();
    // 啟動動畫
    this.animate();
  }
  // 初始化牆壁
  initBoundary() {
    this.boundary = new Boundary();
    this.boundary.draw(this.ctx);
  }
  // 綁事件
  initEvents() {
    this.initVisibilityChangeEvent();
    this.initClickEvent();
  }
  //visibilityChange事件
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
  // 每按一次滑鼠就會在按下去的座標生成一顆球
  initClickEvent() {
    this.cvs.addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.balls.push(new Ball(mouseX, mouseY))
    })
  }

  animate() {
    if (this.frameIsPaused) {
      this.animate();
    }
    const $this = this;
    const dt = (performance.now() - this.time) / 100;
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.animateBalls(dt);
    this.boundary.draw(this.ctx);
    this.time = performance.now();
    requestAnimationFrame(this.animate.bind($this));
  }

  animateBalls(dt) {
    //這邊就是去遍歷過整個球池，把每一顆球都根據其位置/大小/顏色畫出來，然後就跟之前的範例一樣，接著更新位置和速度
    this.balls.forEach((o, i) => {
      o.draw(this.ctx);
      // 更新位置數據
      o.refreshLocation(dt);
      // 這段是我用來防止已經飛出畫面外的球仍然停留在球池物件中，導致重複計算而效能爆炸，做一個簡單的消除
      if (o.x > this.cvs.width || o.y > this.cvs.height || o.x < 0) {
        this.balls.splice(i, 1);
      }
      //更新速度數據
      o.refreshSpeed(dt);
      this.checkBoundary();
    })
  }
  //用來動態設定 canvas大小的方法
  setCanvasSize() {
    this.cvs.width = CANVAS.width;
    this.cvs.height = CANVAS.height;
    this.cvs.style.backgroundColor = CANVAS.background;
  }
  // 這部分就是偵測碰撞
  checkBoundary() {
    // 先遍歷每一面牆壁
    this.boundary.walls.forEach((o, i) => {
      const vectorAB = new Vector2D(
        o[1].x - o[0].x,
        o[1].y - o[0].y
      )
      // 在遍歷每一顆球
      this.balls.forEach((ball, index) => {
        // 這邊其實就是我們前面有提到的傾斜面的碰撞偵測

        //牆壁端點A到球心的向量
        const vectorAToBall = new Vector2D(
          ball.x - o[0].x,
          ball.y - o[0].y
        );
        //牆壁端點B到球心的向量
        const vectorBToBall = new Vector2D(
          ball.x - o[1].x,
          ball.y - o[1].y
        );
        //牆壁端點A到球心的向量映射在牆壁的向量
        const vectorAToBallProj = vectorAToBall.project(vectorAB);
        //牆壁端點B到球心的向量映射在牆壁的向量
        const vectorBToBallProj = vectorBToBall.project(vectorAB);
        //向量互減
        const dist = vectorAToBall.substract(vectorAToBallProj).length();
        if (!dist) return;
        // 這個條件就是在講球離牆壁的距離要低於半徑，且球到牆壁兩端點的向量映射在牆壁上的長度不能超過牆壁長度(意思就是指球是位於牆壁的兩個端點中間)
        const collisionDetection =
          dist < ball.radius &&
          vectorAToBallProj.length() < vectorAB.length() &&
          vectorBToBallProj.length() < vectorAB.length();
        if (collisionDetection) {
          // console.log('boom!!!')
        }
      })

    })
  }
}


document.addEventListener('DOMContentLoaded', () => {
  let ctx = document.querySelector('canvas').getContext('2d');
  let instance = new InclinedWallsAndBouncingBallsAnimation(ctx);
})

````

測試了一下～ 確認有偵測到碰撞 ! (YA)

![img](https://i.imgur.com/ST5iVIC.png)


在明天的部分，我們會接著繼續把這個案例的`reposition` 和`反射` 運算的部分做完! 敬請期待 :D ~
