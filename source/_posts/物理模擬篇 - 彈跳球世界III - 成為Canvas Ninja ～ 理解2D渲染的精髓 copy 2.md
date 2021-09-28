---
title: Day12 - 物理模擬篇 - 彈跳球世界IV - 成為Canvas Ninja ～ 理解2D渲染的精髓.md
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

我們在上一次講到用數理觀點來觀察`反射`行為的諸多細節，而這篇文則是要講解`斜向拋射`。
不過因為`斜向拋射`的概念其實不是挺複雜，所以為了不要浪費篇幅，我也會先把一些程式的實作面先在這一篇做一個簡單的引導～

# 斜向拋射

`斜向拋射`這個名詞，我想應該對很多人來說都有很深的印象。（想當年剛成為理組小菜雞的我在物理課上到這一段的時候真的有三觀被刷新的感覺XD）

`斜向拋射` 顧名思義就是朝某個角度丟出一個球的意思，而丟出去的球會在過程中持續地受到重力的影響，導致它會有每秒向下`1g`的加速度。

![img](https://i.imgur.com/qe1Ion0.png)

我們之前有介紹過`向量`可以分裂成`垂直向量`和`水平向量`，而如果我們觀察被`斜向拋射`出去的球，他的速度其實也可以被拆成`垂直`和`水平`的部分。在`水平`的部分，因為水平方向上沒有受力（我們假設環境中沒有風力或摩擦力），所以`水平`方向的速度會維持不變，但是`垂直`方向就不同了，因為`垂直`方向會受到重力影響，而假設球一開始是往上丟的，那麼球在上升的過程中，上升的速度就會越變越慢，直到達到最高點，接著就會開始往下加速，最後在落地前一刻，他會達到跟剛被丟出去一樣的`垂直`速度(但是方向是相反的)。

若用數學來描述`垂直`和`水平`的速度向量，則可以這樣表示：

```
// θ 是拋射出去的仰角，t是經過時間
horizontalVelocity = v*cos(θ)  // 水平速度
horizontalVelocity = v*sin(θ) - gt // 垂直速度 
```

好啦~ `斜向拋射` 就是這麼簡單，沒什麼特別的。接下來我們會直接帶一個簡單的彈跳球範例來作為熱身用～

# 來看看最簡單的彈跳球範例吧

這邊我們先來看一個沒有傾斜面的範例

其實這個例子在MDN上面也有類似的版本。

> 延伸閱讀：[MDN彈跳球](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Advanced_animations#acceleration)

但是`MDN`上的版本其實簡化了很多東西，例如沒有做碰撞的`Reposition`，除此之外加速度的模擬也沒有透過偵測`經過時間`來給予速度加乘，而是變成每一幀加一點點速度。

`MDN` 之所以可以不用作`Reposition`和`透過偵測經過時間來給予速度加乘`，是因為他的速度設定的很慢，所以就算真的產生`幀間誤差`，也不會出現很詭異的狀況。

通常如果物體運動的速度很快，但是又沒有做`Reposition`，反彈動畫依據程式的寫法差異會有兩種異常現象:

- 球卡進牆壁裡面無限反彈出不來 (最主要就是要防範這種情形)
- 球不在牆壁上反彈，而是在空無一物的地方被彈飛

而加速度的部分，他有給一個`0.99` 的`浮點數`作為`摩擦係數`，這讓球不會在碰撞多次之後產生異常狀況。

那麼這邊我們就來提出自己的版本~

````javascript

const DEFAULT = {
  radius: 40,
  color: 'red',
  speedX: 1000,
  speedY: 30,
  accelerationX: 0,
  accelerationY: 980,
  frictionX: 1,
  frictionY: 0.999,
}

class BasicRefelection {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.time = 0;
    this.cvs = ctx.canvas;
    this.config = config;
    this.init();

  }
  init() {
    this.initBall();
    this.time = performance.now();
    this.animateBall();
    let $this = this;
    
    // 綁定visibilitychange事件
    window.addEventListener('visibilitychange', () => {
       
      if (document.visibilityState !== "visible") {
        $this.frameIsPaused = true;
      }
      else{
        $this.frameIsPaused = false;
        $this.time = performance.now();
      }
      
     
    });
  }
  initBall() {
    let $this = this;
    this.ball = {
      color: $this.config.color,
      radius: $this.config.radius,
      location: {
        x: $this.cvs.width / 2,
        y: $this.cvs.height / 2,
      },
      speed: {
        x: $this.config.speedX,
        y: $this.config.speedY
      },
      acceleration: {
        x: $this.config.accelerationX,
        y: $this.config.accelerationY
      },
      friction: {
        x: $this.config.frictionX,
        y: $this.config.frictionY
      }
    }
  }
  drawBall() {
    this.drawCircle(this.ball.location.x, this.ball.location.y, this.ball.radius * 2, this.ball.color);
  }
  animateBall() {
    let $this = this;
     // 當畫面沒有被暫停（頁簽停在這頁）
      if(!$this.frameIsPaused){
        $this.ctx.clearRect(0, 0, $this.cvs.width, $this.cvs.height);
      // 畫球
      $this.drawBall();
      // 更新位置
      $this.refreshLocation();
      // 更新速度
      $this.refreshSpeed();
      // 檢查碰撞行為，確定是否倒轉向量
      $this.checkBoundary();
      // 更新紀錄時間
      $this.time = performance.now();
      // 用RAF遞迴$this.animateBall()
      requestAnimationFrame($this.animateBall.bind($this));
      }
    // 當畫面被暫停，就單純的遞迴$this.animateBall()
    else{
      $this.animateBall();
    }
      
  }

  refreshSpeed() {
    let dt = (performance.now() - this.time) / 1000;
    this.ball.speed.x = this.ball.speed.x * this.ball.friction.x + this.ball.acceleration.x * dt;
    this.ball.speed.y = this.ball.speed.y * this.ball.friction.y + this.ball.acceleration.y * dt;
  }

  refreshLocation() {
    let dt = (performance.now() - this.time) / 1000;
    
    this.ball.location.x += this.ball.speed.x * dt;
    this.ball.location.y += this.ball.speed.y * dt;
  }
  checkBoundary() {
    let ball = this.ball;
    let canvas = this.cvs;
    // 當球正在底端
    if (ball.location.y + ball.radius > canvas.height) {
      // 且速度為正值（朝下）
      if (ball.speed.y > 0) {
        ball.speed.y = -ball.speed.y;
      }
    }
    // 當球正在頂端
    else if (ball.location.y - ball.radius < 0) {
      // 且速度為負值（朝上）
      if (ball.speed.y < 0) {
        ball.speed.y = -ball.speed.y;
      }
    }

    // 當球正在右端
    if (ball.location.x + ball.radius > canvas.width) {
      if (ball.speed.x > 0) {
        ball.speed.x = -ball.speed.x;
      }
    }
    // 當球正在左端
    else if (ball.location.x - ball.radius < 0) {
      if (ball.speed.x < 0) {
        ball.speed.x = -ball.speed.x;
      }
    }

  }
  drawCircle(x, y, width, color, alpha) {
    let ctx = this.ctx;
    ctx.save()
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, width / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

(()=>{
  let ctx = document.querySelector('canvas').getContext('2d');
  let instance = new BasicRefelection(ctx,DEFAULT)
})()

````

> codepen連結：https://codepen.io/mizok_contest/pen/ZEymVZQ?editors=1010


這邊說明一下程式的流程面：

- `class` 在創建實例之後會進入入口方法`init`
- `init` 會先創建`球`物件的`refernece`，物件內會根據輸入的參數預設一個初始速度向量，和加速度與顏色/球的大小之類的數值, 而球的初始位置定在Canvas正中央。
- 接下來就會進入`animateBall` 開始進行動畫
- animateBall 會分成幾個階段：
  - 先一律清除畫布
  - 根據`球`物件中紀錄的`當前位置`、`大小`、`顏色`等畫出`球`
  - 更新`球`物件中紀錄的位置，更新的方法為`球`的`舊位置`+`速度`*`幀間時差(dt)`
  - 更新`球`物件中紀錄的瞬時速度，更新的方法為`球`的`舊速度`+`加速度`*`幀間時差(dt)`
  - 判斷下一幀時，球是否會`碰撞`到牆壁，若確定會`碰撞`，則`逆轉`對應的速度分量，這邊我們調整了優化了碰撞反彈的判斷，在判斷反彈時補上一個防呆判定，讓球不至於會卡進去牆壁裡面出不來，


這邊值得一提的是，由於我們在前面有講過，`canvas`專案適合使用requestAniamtionFrame(簡稱RAF)來做動畫幀渲染的looping。

**但是**實際上RAF本身有個特點，就是他只會在頁面"visible"時觸發。

在這種情況下，因為我們在速度計算上是採用`幀間時差`制來計算(而不是By Frame)，如果我們讓頁面進入`hidden`狀態(例如切換`頁籤`/縮小視窗)然後再切換回`visible` 狀態，球的速度就會因為`hidden`的時候都沒有去刷新`this.time`(用來記錄當下時間的property)而產生`暴走`的現象。

這邊就可以利用window的預設事件`visibilitychange` 來阻止`暴走`發生，藉由偵測`document.visibilityState`來判斷是否在切換回`visible` 時刷新`this.time`。

以上就是`彈跳球`在沒有`傾斜面`的動畫程序範例～  

下一篇文我們將會介紹有`傾斜面`的狀況下，程式的寫法，敬請期待 :D







