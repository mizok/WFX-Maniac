---
title: Day11 - 物理模擬篇 - 彈跳球世界II - 成為Canvas Ninja ～ 理解2D渲染的精髓.md
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

繼上一篇我們講到`向量類`的建立，接著我們在這一篇文機會提到`反射`行為的模擬~
`反射`這種行為，在`反射面`為`鉛直`或`水平`時比較單純，所以大部分的Canvas彈跳球動畫教程都是針對這種狀況去做出來的。
但是在本篇的案例中，我們會提到在`傾斜面`上如何透過向量運算來計算反射的角度，同時也會講解Canvas物理模擬和現實物理最大的差異之一：『`幀間誤差`』，以及應對『`幀間誤差`』的解決辦法『`歸位`(Reposition)』。

`反射`會是整個案例最複雜的部分，所以我會盡可能地描述仔細一點～

# 從數理幾何觀點來看反射

![img](https://i.imgur.com/uUXsxes.png)

如果說反射面只是單純的水平或垂直面，那麼反射的運算其實就很簡單，就是把垂直於反射面的向量分量倒轉而已。

但是如果今天反射面是傾斜的，那麼情況可就大不同了。

下圖中描繪著一個即將碰撞到傾斜面的球。(坐標系是使用Canvas的坐標系)

![img](https://i.imgur.com/TT3WH7W.png)

從上面這張圖，我們可以先定義兩個有關該球碰撞傾斜面當下瞬間的假設，也就是所謂的『碰撞偵測(Collision Detection)』

- 球的中心到傾斜面距離低於球的半徑
- 球的座標位置必須要介於傾斜面的兩個端點之間

接著我們再來看看這張圖。

![img](https://i.imgur.com/HUzZcVh.png)

假設我們一開始就知道球心的位置，和端點A&B的座標，這樣我們就可以藉由這些數據去取得球心到斜面的垂直距離。

算法大致上是這樣的：

````javascript
// 已知球心座標和兩端點座標
// 所以這樣也就可以取得『向量AP』和『向量BP』還有反射面端點A到B形成的『向量AB』

let vectorAPP = vectorAP.project(vectorAB); //透過我們之前寫的向量類中的投射(project)方法來取得『向量APP』
let dist = vectorAP.substract(vectorAPP).length(); // 透過向量差值來取得d的長度
````

> 如果對高中數學還有印象的人其實也可以用點到線公式去求取距離，不過那就會是另外一套算法了

接下來我們要講講所謂的『`幀間誤差`』和『`歸位(reposition)`』。

我們在前面有提到過，canvas的動畫是藉由不斷地清除畫面後再重繪來達成的，所以說事實上球的動畫並不是一個完全連續的運動。

> 意思就是說假設1/60 秒的時候球的位置在0, 而2/60秒的時候球的位置在0.1，但是實際上1/60~2/60秒之間，球是沒有在運動的

這意味著球的運動其實是『格進』，所以說球在接近反射面的過程中，非常可能不會剛好有『球心與反射面距離 = 半徑』的狀況，多半情況下可能是球『插』進去了反射面裡面。

這個就是所謂的『`幀間誤差`』，而應對幀間誤差的方式之一就是使用『`歸位(reposition)`』：

假設球已經『插』進去反射面，則把它歸位回正好『球心與反射面距離 = 球半徑』的位置。

歸位後的位置，我們可以透過球心和反射面距離d，利用比例原理去計算出來。

![img](https://i.imgur.com/ytr8c2D.png) 

> 圖片來自 Apress Physics for JavaScript Games Animation and Simulations, With HTML5 Canvas

事實上，`幀間誤差`還有一個可能導致更大影響的問題在，那就是在球本身具有加速度時的狀況。

在現實物理中，我們都知道若物體有受力，那麼它就必然的會產生加速度(牛頓第二定律)，而這種行為如果要用Canvas模擬出來，就會受到`幀間誤差`的影響。
我們在前面有提到，`幀間誤差`的成因是因為canvas動畫的物體實際上是格進式的運動，以『`球碰撞牆壁`』這個案例來看，球有很大的機會在判斷撞上牆壁的那一刻，他會『`插`』進去牆壁一小段距離，而這一小段距離實際上也會給球帶來比預期還要多的`速度加成`(原本在現實生活中頂多是加速到球心和牆壁距離為半徑而已)，這種現象最終將會造成球每碰撞一次牆壁，就變得越快，而在碰撞多次的情況下可能就會造成動畫走鐘。

通常上述這種狀況的解法，我們可以為球加上一個值介於`0~1`之間的摩擦係數`K`，讓球在每次反彈的時候去把當下的速度向量做一部分的縮減，也就是變相地去抵銷`幀間誤差`所帶來的影響。

但是畢竟摩擦係數算是比較消極一點的做法，比較積極且精確的做法當然還是有，那就是利用第三加速度公式：  

````
V^2=V0^2+2aS
````

由於我們在上面有提到，我們可以計算得出『`歸位(reposition)`』後的座標，那也就意味著我們可以計算出來歸為前一幀到歸位時所移動的長度，這樣也就可以進一步計算出歸位時的速度。

最後我們來到`反射`角度的計算，這部分就相對簡單一些。

![img](https://i.imgur.com/6LD2Qd5.png)

`反射`後的速度向量，我們在這邊可以把他分割成`沿著反射面方向`的部分，和`垂直於反射面`的部分，而計算上則可以直接透過`向量類`的project方法來求得`沿著反射面方向`的部分，最後再用扣的去取得`垂直於反射面`的部分。

```
normalVelocity = dist.para(particle.velo2D.projection(dist));
tangentVelocity = ball.velocity.subtract(normalVelocity);
```

# 小結

這邊我們講解完了`反射`的運算方法，在接下來的部分我們會繼續帶到`斜向拋射`的部分，然後在逐漸地去把我們在文章中描述的邏輯構建到程式中~