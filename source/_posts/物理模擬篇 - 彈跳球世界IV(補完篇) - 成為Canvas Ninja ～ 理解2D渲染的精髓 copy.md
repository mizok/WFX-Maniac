---
title: Day14 - 物理模擬篇 - 彈跳球世界IV(補完篇) - 成為Canvas Ninja ～ 理解2D渲染的精髓.md
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

> 沒錯~我就硬是不要給把標題打成『彈跳球世界V』，咬我啊～

今天要來補完我們在上一篇沒有解決掉的`reposition` 和`反射`速度運算的部分，這邊把之前的圖重新貼一次，讓大家能更方便的對照程式中向量運算的規則。

![img](https://i.imgur.com/ytr8c2D.png) 

源碼的部分可以直接看[repo](https://github.com/mizok/inclined-wall-ball/blob/master/src/js/index.js)，每個運算的細節段落我都有用註解說明~;

然後[這裡](https://mizok.github.io/inclined-wall-ball/index.html)是repo的Github Page

我簡單錄了一段實際play的畫面：
https://www.youtube.com/watch?v=RNBeN_19KdQ


## 我發現好像球還是有低機率產生異常的穿牆行為？

穿牆的`bug`之所以會發生，是因為動畫是`frame by frame`的。

有時候球在接近牆壁時，在`這一幀`還沒碰到牆壁，但是在`下一幀`卻已經完全`穿越過牆壁`了，這就導致`碰撞偵測`完全沒有被觸發。

> 延伸閱讀：[避免子彈穿越牆壁](http://sammaru.blogspot.com/2019/10/blog-post.html)

其實這個現象在物理模擬的領域有一個正式的名稱: `穿隧效應(Tunneling)` 

符合下列條件的情形，`穿隧效應`發生的機率會比較高：

- 球速非常快
- 球的半徑非常小
- 牆板不夠厚

其實物理模擬的碰撞偵測是一種很深的學問，而我在這個案例裡面用的方法是所謂的『`離散式碰撞偵測(Discrete collision detection)`』，通常如果要實現高速物體的碰撞偵測，要使用『`連續式碰撞偵測(Continuous collision detection (CCD) )`』。

`連續式碰撞偵測`的原理是依靠預先演算物體未來的前進軌跡，偵測其前進軌跡上是否有障礙物，計算出可能發生的碰撞，還有碰撞的`時間點`和`碰撞位置`，然後準確地在那個`時間點`去把`物體`移位到指定的座標，避免`穿隧效應`發生。

在這個系列我其實沒有打算把這個領域的知識擴展到這麼深，但是如果真的要在前端環境實現`CCD` ，其實可以依賴一些現有的`物理引擎`，例如

- [phaser](https://phaser.io/)

- [Box2D](http://kripken.github.io/box2d.js/demo/webgl/box2d.wasm.html)


