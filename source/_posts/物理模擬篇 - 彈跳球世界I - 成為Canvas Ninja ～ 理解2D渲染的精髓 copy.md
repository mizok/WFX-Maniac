---
title: Day10 - 物理模擬篇 - 彈跳球世界I - 成為Canvas Ninja ～ 理解2D渲染的精髓.md
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

作為物理模擬開場的第一進程，當然就要來講一下最經典的物理模擬案例:『彈跳球』～
其實很多國外的Canvas特效教程都會把這一篇當成第一個介紹案例，比方說
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Advanced_animations)
- [Apress Physics for JavaScript Games Animation and Simulations, With HTML5 Canvas (2014)](https://www.amazon.com/Physics-JavaScript-Games-Animation-Simulations/dp/1430263377)
- ...

這邊推薦一下 `Apress Physics for JavaScript Games Animation and Simulations` 這本書，因為在學習物理模擬的路上這本書給了我不少幫助XD～

在這個案例中我們除了會介紹彈跳球的案例，還會介紹一些關於這個案例的基礎物理常識，最後還會帶到一些更進階的物理模擬實作。

在一開始我們還不會馬上的帶到程式源碼，而是要先來討論高中數理的`向量`、`反射`與`斜向拋射`，由於我們在這個案例中會持續用到的三個基礎概念，所以我打算在一開始就講清楚物理模擬在這三部分的相關概念。

我們在這篇文章中會先討論到`Canvas`中`向量類`的建立，就讓我們接著開始吧~


## 向量是什麼樣的概念？

我們其實在前面的文章有提過`向量`，向量指的是一種從座標A移動到座標B的附帶方向的移動量，從數學的角度上來看，假設今天有一個質點即將從`(1,2)`移動到`(2,4)`，則我們可說這個質點被附加了一個`(1,2)`的移動向量。

向量如果要轉變成純量，那麼就必須要取該向量X,Y值的平方和,然後再開根號(畢氏定理)，以我們剛剛提到的`(1,2)`，他的純量就是`√5`（也就是該質點一共移動了`√5`的距離長度）。

向量再轉變成純量的過程中會丟失他的方向屬性，而變成單純的量值，所以如果今天換成另外一個案例，假設我們只知道移動的距離是`√5`而不知道這個移動的起始點和結束點; 想要把√5這個距離轉變成向量(也就是要知道水平和垂直移動的距離)，那我們就必須要先獲知該純量的方向(也就是下圖中的角度`θ`)，然後用三角函數來把`√5`轉變成`1`(水平移動量)和`2`(垂直移動量)。

![img](https://i.imgur.com/c8pjt1m.png?1)

````
(cosθ * √5, sinθ * √5) = (1,2)
````
除了向量變純量, 純量變向量的運算以外，向量之間有其他類型的運算，像是：

- 相加/相減

以下面這張圖為例，我們可以可以把紫色向量看作是向量a(紅色向量)和向量b(藍色向量)的和。
所以反過來也可以推導`紫色向量` - `向量a` = `向量b`

![](https://i.imgur.com/JsS9KG4.png?1)

- 內積

`內積`是一個有趣的概念，求取兩個向量`內積`的方法如下：

````
假設向量a為(ax,ay),向量b則是(bx,by)
則向量a與向量b的內積是ax*bx+ay*by
````
內積的結果會是一個純量，他的幾何意義在於我們可以透過內積取得兩個向量的夾角。
透過內積取得夾角的公式如下：

![img](https://i.imgur.com/fAEHaLC.png)

一般來說，內積的值大於`0`，代表兩向量夾角低於`90度`，  
內積的值等於`0`，代表兩個向量`互相垂直`，  
內積的值小於`0`，代表兩個向量夾角介於`90度到180度`之間。

>  對公式推導有興趣的人可以看[這邊](https://www.itread01.com/content/1545714846.html)

## 用javascript建立向量類(Vector Class)

在前端開發的環境下，我們其實可以利用ES6的class(當然也可以用ES5的構築式)去給`向量`建立一個獨立的類。

````javascript
class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   * 求純量值
   *
   * @returns
   * @memberof Vector2D
   */
  length() {
    return Math.sqrt(this.lengthSquared());
  }
  /**
   * 複製該向量
   *
   * @returns
   * @memberof Vector2D
   */
  clone() {
    return new Vector2D(this.x, this.y);
  }
  /**
   *倒轉該向量
   *
   * @memberof Vector2D
   */
  negate() {
    this.x = - this.x;
    this.y = - this.y;
  }

  /**
   * 把該向量轉變成單位向量
   *
   * @returns
   * @memberof Vector2D
   */
  normalize() {
    let length = this.length(); if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this.length();
  }

  /**
   * 回傳與某向量的向量和
   *
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  add(vec) {
    return new Vector2D(this.x + vec.x, this.y + vec.y);
  }

  /**
   * 加上某向量
   *
   * @param {*} vec
   * @memberof Vector2D
   */
  incrementBy(vec) {
    this.x += vec.x;
    this.y += vec.y;
  }

  /**
   * 
   * 回傳與某向量的向量差
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  subtract(vec) {
    return new Vector2D(this.x - vec.x, this.y - vec.y);
  }

  /**
   * 扣除某向量
   *
   * @param {*} vec
   * @memberof Vector2D
   */
  decrementBy(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
  }


  /**
     * 回傳擴增k倍後的向量
     *
     * @param {*} k
     * @memberof Vector2D
     */
  multiply(k) {
    return new Vector2D(k * this.x, k * this.y);
  }

  /**
   * 擴增該向量
   *
   * @param {*} k
   * @memberof Vector2D
   */
  scaleBy(k) {
    this.x *= k; this.y *= k;
  }


  /**
   * 求取該向量與其他向量的內積
   *
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  dotProduct(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  /**
   * 求取此向量映射在某向量上的長度
   *
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  projection(vec) {
    const length = this.length();
    const lengthVec = vec.length();
    let proj;
    if ((length == 0) || (lengthVec == 0)) {
      proj = 0;
    } else {
      proj = (this.x * vec.x + this.y * vec.y) / lengthVec;
    }
    return proj;
  }

  /**
   * 回傳一個新向量，新向量的方向會跟作為參數向量相同，但是量值上是作為此向量投射在參數向量上的長度
   *
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  project(vec) {
    return vec.para(this.projection(vec));
  }


/**
   * 根據傳入的u值來回傳一個u倍(或-u倍)的單位向量
   *
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  para(u, positive = true) {

    const length = this.length();
    const vec = new Vector2D(this.x, this.y);
    if (positive) {
      vec.scaleBy(u / length);
    } else {
      vec.scaleBy(-u / length);
    }
    return vec;
  }

  /**
   * 求取該向量與其他向量的夾角
   *
   * @param {*} vec
   * @returns
   * @memberof Vector2D
   */
  static angleBetween = function (vec1, vec2) {
    return Math.acos(vec1.dotProduct(vec2) / (vec1.length() * vec2.length()));
  }

}

````

這邊我其實是參照`Apress Physics for JavaScript Games Animation and Simulations, With HTML5 Canvas` 上的寫法，改寫成ES6 Class，並刪除部分不常用到的方法。

我們在接下來的文章中會持續的用到由這邊建立好的向量類，所以各位同學可以看一下這個類裡面都有些什麼方法~

下一篇文我們將會講到如何在Canvas中實作反射(Reflection)行為，敬請期待~


