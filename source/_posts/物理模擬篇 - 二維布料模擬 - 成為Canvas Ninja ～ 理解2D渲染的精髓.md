---
title: Day 22 - 物理模擬篇 - 二維布料模擬 - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

時間過得很快，這邊我們已經來到物理模擬篇的最後一節 ~ `二維布料模擬`了。  

原本其實我是打算把這一篇放在`彈性模擬`後面做講解，因為這個案例其實就是上位版本的`彈性模擬`。

但是前幾天因為工作上的關係有點*小忙*，而且這一部分又*稍微*複雜一點，所以我後來想想還是把它放到*最後面來講*。

那麼就讓我們開始吧～

# 布料模擬

其實`二維布料模擬`這個案例應該很多人都有在`codepen` 上面看過。

> 也就是這個：https://codepen.io/dissimulate/pen/KrAwx
> 備用連結： https://codepen.io/mizok_contest/pen/yLXmrwg

爲什麼我們會說`布料模擬`其實也就是上位版本的`彈性模擬`呢?

我們還是老樣子來看看這個案例的`力學模型`~

![img](https://i.imgur.com/xjOMZmf.png?1)

有沒有發現其實邏輯上跟我們之前提到的`二維彈性模擬`其實是很類似的。

> 之前提到的二維彈性模擬： https://ithelp.ithome.com.tw/articles/10276634

唯一不同的幾個點就在於，在`布料模擬`這個案例下：

- 我們會用for loop的方式去產生全部的`弦`,和`質點`
- 這次一顆球上面最多會有`4`條弦相連

其他邏輯的計算方法其實**差異不大**。

不過既然`codepen`上面已經有源碼了，那我也就不再自己寫一版（堂堂正正的偷懶～

我們在這一篇主要目標就是逐段落解釋這個案例`實作的邏輯`。

---

# Codepen源碼解析

首先前面這邊是簡介面板的叉叉點擊事件，不太重要所以快速帶過。

````javascript
document.getElementById('close').onmousedown = function(e) {
  e.preventDefault();
  document.getElementById('info').style.display = 'none';
  return false;
};
````

然後接著這邊開始了參數的設置細節。  
我們會在註解中一項一項講解每項是在做什麼～

````javascript

// settings

var physics_accuracy  = 3, //上面寫的是物理準確度，這個其實是在用來在每次執行raf循環時，藉由跑這個數目的迴圈次數，來達到多次刷新摩擦力耗損運算的做法，數字越高的話動畫會越穩定，比較不會有脫離理想物理情境的狀況發生，但同時吃的效能也會增加
    mouse_influence   = 20, // 這個就是滑鼠在移動時會影響到的範圍半徑
    mouse_cut         = 5, // 案例中其實可以按著右鍵不放來切斷弦(原理是消除指定的彈力弦)，而這個參數決定了右鍵切斷影響的範圍半徑
    gravity           = 1200,//重力
    cloth_height      = 30,//整體布幕的高度，30也就代表垂直向一共30格
    cloth_width       = 50,//整體布幕的寬度，50也就代表垂直向一共50格
    start_y           = 20,//布幕到Canvas上緣的距離
    spacing           = 7,//每格的大小
    tear_distance     = 60;// 案例中如果將布幕拉伸過度(超過這個值)，他就會清除掉這條弦

````

這個其實就是RAF的Polyfill，主要是用來應對部分老式瀏覽器沒有RAF這個API的情形，  
或者部分瀏覽器的RAF api名稱跟規範不一樣。
其實這個polyfill 在很多動畫相關的Library源碼都很常見～

````javascript

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
};

````

這段是一些初期的變數宣告，我們也同樣一一附上註解～

````javascript
var canvas,
    ctx,
    cloth,
    boundsx, // 這個是Canvas的寬度 - 1, 主要是用來做牆面反射計算用(可以仔細注意當把布幕拉斷時，布幕斷掉的部分撞擊到牆面或地板時，其實會產生反射行為)
    boundsy, // 用途同上，但是這是高度部分
    // 用全域變數記錄滑鼠狀態
    mouse = {
        down: false,
        button: 1,
        x: 0, // mouse 的x 是滑鼠當下在canvas上面的x座標
        y: 0, // mouse 的y 是滑鼠當下在canvas上面的y座標
        px: 0, // mouse 的py 會在每次mousemove的時候去紀錄mouse.x上一次觸發mousemove的值，這個屬性主要是用來計算滑鼠的瞬時移動長度用
        py: 0 // px 的y座標版本
    };

// 這邊把每條弦之間連接的質點稱為Point，而這是Point的建構式

var Point = function (x, y) {
    this.x      = x;
    this.y      = y;
    this.px     = x;
    this.py     = y;
    this.vx     = 0; // x方向速度
    this.vy     = 0; // y方向速度
    this.pin_x  = null; //pin 就是圖針的意思，這個屬性主要是用在把Point固定在某個地方(例如靠頂邊的Point,也就是固定在天花板的部分)
    this.pin_y  = null;
    
    this.constraints = []; // 這個案例跟我們的二維彈力模擬比較不同的地方就是他是把弦記錄在質點的實例內部，而這個陣列就是紀錄的地方
};

````

這個就是Point的刷新方法，用來讓Point在每次RAF循環做更新數值用

````javascript
Point.prototype.update = function (delta) {
    if (mouse.down) {//當滑鼠按下
        var diff_x = this.x - mouse.x,
            diff_y = this.y - mouse.y,
            dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

        if (mouse.button == 1) { // 1就代表是滑鼠左鍵
            if (dist < mouse_influence) {//左鍵按下拖曳時會導致滑鼠半徑方圓 mouse_influence 內的質點同步被拖動
                this.px = this.x - (mouse.x - mouse.px) * 1.8;
                this.py = this.y - (mouse.y - mouse.py) * 1.8;
            }
          
        } else if (dist < mouse_cut) this.constraints = [];
    }
    // 補上重力運算
    this.add_force(0, gravity);
    // delta 就是摩擦係數
    delta *= delta;
    nx = this.x + ((this.x - this.px) * .99) + ((this.vx / 2) * delta);
    ny = this.y + ((this.y - this.py) * .99) + ((this.vy / 2) * delta);

    this.px = this.x;
    this.py = this.y;

    this.x = nx;
    this.y = ny;

    this.vy = this.vx = 0
};

````

下面是用來畫出每條弦的方法。
這個案例有趣的一點就是這個案例所有的迴圈都是用while來取代for 或 forEach，我猜測是為了節省效能，畢竟這個運算的規模比我們的二維彈性模擬大多了。

````javascript

Point.prototype.draw = function () {
    if (!this.constraints.length) return;

    var i = this.constraints.length;// 其實這兩行就是反過來執行的forEach的意思
    while (i--) this.constraints[i].draw();
};

````


````javascript

Point.prototype.resolve_constraints = function () {
    // 如果目前Point有被下了圖針定位，則把x和y強制定為跟圖針同一位置(簡單來說就是固定Point)
    if (this.pin_x != null && this.pin_y != null) {
        this.x = this.pin_x;
        this.y = this.pin_y;
        return;
    }
    // 把每條弦做彈力的計算
    var i = this.constraints.length;
    while (i--) this.constraints[i].resolve();

    // 這邊這段的寫法有點ninja code
    // 條件? 結果1:結果2 這個其實是是if else的簡寫
    // 這段寫成一般人看得懂的code應該是像這樣的
    // 這個其實就是簡化版的反射行為運算式

    // if(this.x>boundsx){
    //   this.x = 2*boundsx - this.x;
    // }
    // else if(1 > this.x){
    //   this.x = 2 - this.x
    // }

    // if(this.y<1){
    //   this.y = 2 - this.y;
    // }
    // else if(this.y > boundsy){
    //   this.y = 2 * boundsy - this.y
    // }

    this.x > boundsx ? this.x = 2 * boundsx - this.x : 1 > this.x && (this.x = 2 - this.x);
    this.y < 1 ? this.y = 2 - this.y : this.y > boundsy && (this.y = 2 * boundsy - this.y);
};

````

這邊就是像我們前面講的:把弦的實例記錄到質點的實例內部

````javascript

Point.prototype.attach = function (point) {
    this.constraints.push(
        new Constraint(this, point)
    );
};

````

這邊是一些比較功能性的方法

````javascript

// 用來消除掉質點實例中特定的弦
Point.prototype.remove_constraint = function (constraint) {
    this.constraints.splice(this.constraints.indexOf(constraint), 1);
};
// 上面寫說addForce，但是實際上是更新質點的速度，因為質點很輕(=1)，所以加速度就跟受力等價
Point.prototype.add_force = function (x, y) {
    this.vx += x;
    this.vy += y;
  
    var round = 400;
    // 這個運算比較特別一點，不過我猜也是用來作效能節省的運算之一
    // 單一一個 ~ 的用途是可以求得  => ((大於等於該數值的整數)+1) * -1 , 所以兩個 ~ 效果上會接近Math.floor，但是整體效能會比Math.floor來的好一點
    // 之所以要用整數去計算，是因為浮點數其實相對不利於canvas渲染(因為容易導致瀏覽器需要做反鋸齒的渲染運算)
    this.vx = ~~(this.vx * round) / round; 
    this.vy = ~~(this.vy * round) / round;
};

// 設置圖針座標
Point.prototype.pin = function (pinx, piny) {
    this.pin_x = pinx;
    this.pin_y = piny;
};


//弦的建構式
var Constraint = function (p1, p2) {
    this.p1     = p1;
    this.p2     = p2;
    this.length = spacing;
};

````

resolve 就是指弦的彈力運算，這邊的作法也跟我們之前的彈力模擬差異不大，但最主要的差別就是我們是用向量類來做彈力計算，而這邊就是完全靠每圈RAF之間的座標變化。

````javascript
Constraint.prototype.resolve = function () {
    var diff_x  = this.p1.x - this.p2.x,
        diff_y  = this.p1.y - this.p2.y,
        dist    = Math.sqrt(diff_x * diff_x + diff_y * diff_y),
        diff    = (this.length - dist) / dist;

    if (dist > tear_distance) this.p1.remove_constraint(this);

    var px = diff_x * diff * 0.5;
    var py = diff_y * diff * 0.5;

    this.p1.x += px;
    this.p1.y += py;
    this.p2.x -= px;
    this.p2.y -= py;
};

// 弦的繪製方法

Constraint.prototype.draw = function () {
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
};

````

這段就是初始化整張布幕的弦 和質點，會根據質點的位置來計算他會有幾根弦連結在上面

````javascript

var Cloth = function () {
    this.points = [];

    var start_x = canvas.width / 2 - cloth_width * spacing / 2;

    for (var y = 0; y <= cloth_height; y++) {
        for (var x = 0; x <= cloth_width; x++) {
            var p = new Point(start_x + x * spacing, start_y + y * spacing);

            x != 0 && p.attach(this.points[this.points.length - 1]);// 在與左方的點之間產生弦
            y == 0 && p.pin(p.x, p.y); //如果點是位於頂端的點，則設置圖針座標將點固定
            y != 0 && p.attach(this.points[x + (y - 1) * (cloth_width + 1)]) // 在與上方的點之間產生弦

            this.points.push(p);
        }
    }
};

Cloth.prototype.update = function () {
    var i = physics_accuracy;

    // 一次性的做彈力運算

    while (i--) {
        var p = this.points.length;
        while (p--) this.points[p].resolve_constraints();
    }

    // 一次性的更新所有點的位置

    i = this.points.length;
    while (i--) this.points[i].update(.016);
};

// 一次性畫出所有點的方法

Cloth.prototype.draw = function () {
    ctx.beginPath();

    var i = cloth.points.length;
    while (i--) cloth.points[i].draw();

    ctx.stroke();
};

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cloth.update();
    cloth.draw();

    requestAnimFrame(update);
}
````

這邊就是普通的事件綁定，還有一些ctx屬性的設定

````javascript

function start() {
    canvas.onmousedown = function (e) {
        mouse.button  = e.which;
        mouse.px      = mouse.x;
        mouse.py      = mouse.y;
        var rect      = canvas.getBoundingClientRect();
        mouse.x       = e.clientX - rect.left,
        mouse.y       = e.clientY - rect.top,
        mouse.down    = true;
        e.preventDefault();
    };

    canvas.onmouseup = function (e) {
        mouse.down = false;
        e.preventDefault();
    };

    canvas.onmousemove = function (e) {
        mouse.px  = mouse.x;
        mouse.py  = mouse.y;
        var rect  = canvas.getBoundingClientRect();
        mouse.x   = e.clientX - rect.left,
        mouse.y   = e.clientY - rect.top,
        e.preventDefault();
    };

    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    boundsx = canvas.width - 1;
    boundsy = canvas.height - 1;

    ctx.strokeStyle = '#888';
  
    cloth = new Cloth();
  
    update();
}

window.onload = function () {
    canvas  = document.getElementById('c');
    ctx     = canvas.getContext('2d');

    canvas.width  = 560;
    canvas.height = 350;

    start();
};
````



