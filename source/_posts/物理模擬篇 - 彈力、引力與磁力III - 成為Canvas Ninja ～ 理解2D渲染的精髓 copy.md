---
title: Day18 - 物理模擬篇 - 彈力、引力與磁力II - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

# 二維彈性模擬(第二部分)

我們在上一篇文做完了整體案例場景的搭建，而我們接下來則是要把後續的物理運算做完~

簡單用圖片講解一下這個案例的物理模型 :

![img](https://i.imgur.com/bLm9LGe.png?1)

畫面中每一顆球都是以具有`彈力`的`Cord(弦)` 來串連，而球本身會具有重量，
這意味著整條`彈力鍊`在靜止的時候，`重力` 和`彈力` 其實會維持打平的狀態。

而若今天我們用某種手段去改變`球`與`球`之間的`距離`，這樣就會破壞`彈力`和`重力`之間的平衡。

當`弦(Cord)` 被`拉長`的時候，兩顆球之間的`彈力`就會變強，進而導致`上面`的球被往`下`拉，`下面`的`球`被往`上`拉，而`上面`的`球`又連鎖影響更上面的`球`。

## 怎麼實作抓取球的部分？

這部分的話可以利用泡沫排序法(Bubble Sorting);  

邏輯流程上大概是像這樣的:  

-  監聽滑鼠點擊到`Canvas`, 抓取clientX/clientY
-  用for loop 一一比對滑鼠點擊點和每一顆球的距離
-  距離最小者(並且同時要小於最大容許抓取距離)就是被抓取到的那顆球

````javascript
grabBall(x, y) {
    if (!!this.ballGrabbed) return;
    // 用泡沫排序法去求得目前距離滑鼠位置最近的球
    this.ballGrabbed = this.balls[0];
    let shortestDist = this.getDist(x, y, this.ballGrabbed);
    for (const ball of this.balls) {
      const dist = this.getDist(x, y, ball);
      if (dist <= shortestDist) {
        shortestDist = dist;
        this.ballGrabbed = ball;
      }
    }
    if (this.ballGrabbed.fixed || shortestDist > MAX_GRAB_DIST) return;
    this.pullBall(x, y, shortestDist)
  }
````

完整程式的部分可以看這邊的Repo~

https://github.com/mizok/ithelp2021/tree/master/src/js/elastic-2d/index.js


在接下來的文章，我們將會提到磁力/ 引力 的實作，磁力/ 引力其實和彈力有異曲同工之妙， 敬請各位期待 :D ~
