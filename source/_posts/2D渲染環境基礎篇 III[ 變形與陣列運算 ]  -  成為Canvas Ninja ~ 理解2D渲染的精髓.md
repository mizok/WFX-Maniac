---
title: Day7 - 2D渲染環境基礎篇 III[ 變形與陣列運算 ] -  成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

之前我們有提到過，canvas其實本身可以看做一群像素形成的2維陣列，而Canvas的圖像變形，其實就是對canvas自身做的一種陣列運算。  

高中讀理組的同學可能還記得數學課學過的『旋轉矩陣』、『平移矩陣』...之類的東西~沒有錯，其實Canvas的變形API背後的原理就是矩陣運算～而第一次聽到這些名詞的人也不用太擔心如何理解這些數理常識，因為在2D渲染環境的case中，其實光靠API就已經可以處理絕大部分的變形問題。

接下來我們就直接看看變形相關的API都有哪些～
# Rotate/Translate/scale
之所以把這三個放在一起介紹，是因為這三個API常常會一同使用。

有些人可能會想像canvas的旋轉應該就是旋轉當前畫好的圖像，但是實際上不是的。  
Canvas的旋轉是固定以**座標軸原點**(0,0)為旋轉中心轉動整張canvas。

就像MDN上面的這張圖片一樣

![img](https://i.imgur.com/WWyvfm7.png)

到這邊一定會有人問~那如果說我需要以某個座標作為旋轉中心, 要怎麼辦？
這時候就會用到ctx.translate。ctx.translate的用途是把座標軸中心移動到指定新座標，這樣我們就可以透過移動**座標軸原點**來滿足移動旋轉中心的需求

![img](https://i.imgur.com/QAUyriB.png)

而最後scale其實就跟rotate差不多，比較不同的是scale可以輸入兩個參數，一個參數是for X軸，另一個for Y軸(分別是兩個方向的縮放變形)，而當然因為縮放也同樣會有所謂的"變形中心"，變形中心也就跟rotate一樣固定默認為座標軸原點，所以要移動變形中心也是必須要依賴ctx.translate
# Transform/setTransform/getTransform

之所以把Transform系列的API 獨立出來講，是因為Transform的參數稍多，一條一條拉出來講解比較清楚些。
而且因為這個API會牽涉到一點點矩陣運算的常識，所以我想也可以稍微提到點這部分背後的運算邏輯(其實還蠻有趣的)～

> 由於這邊我們不會另外講解一般矩陣運算的做法，高中沒有學過或已經還給老師的人可以看[這邊](https://highscope.ch.ntu.edu.tw/wordpress/?p=50848)

## ctx.transform() 的用法

````javascript  
void ctx.transform(a, b, c, d, e, f); //一共會有六個參數

//a (m11): 水平scale參數, 最小值為1

//b (m12): Y軸傾斜參數(skewY) , 最小值為0

//c (m21): X軸傾斜參數(skewX) , 最小值為0

//d (m22): 垂直scale參數 , 最小值為1

//e (dx): X軸平移參數 , 最小值為0

//f (dy): Y軸平移參數 , 最小值為0

````

在這邊我們可以看到這些m11、m12..,etc.這些奇怪的代號，這邊m11,m12,m21,m22指的是**當前變形矩陣**(Current Transform Matrix, 簡稱CTM)的四個子項名稱(例如m11意思就是CTM的第一行第一列的元素)。

所謂的**當前變形矩陣**(CTM)是一個3x3矩陣，用途是用來表示canvas元素當前的變形狀態，而當我們每次去使用ctx.scale/ctx.translate/ctx.transform/ctx.rotate 最終都會導致CTM產生變化。  

仔細觀察上面a,b,c,d,e,f 這幾個參數，會發現一個有趣的地方，那就是這些參數似乎沒有跟Rotate相關的數值(例如角度)，這是因為~ Canvas的旋轉，其實是SkewX/SkewY 合併運用而產生的結果，所以這邊我們可以看到SkewX/SkewY相關的參數，但卻看不到Rotate的Degree值。

## ctx.getTransform()/ctx.setTransform() 的用法

首先，這兩個方法其實就是直接去 取得/設定 CTM。  
getTransform 本身並沒有參數，他會回傳當前渲染環境的CTM陣列值。  

````javascript
let storedTransform = ctx.getTransform();
````

setTransform 本身的參數則和transform一模一樣，但是他和transform的差別就在於setTransform是直接賦予CTM指定的新陣列值，而transform的陣列值則會透過矩陣乘積的方式累計到當前的CTM上(後面會提到)

````javascript  
void ctx.transform(a, b, c, d, e, f); //一共會有六個參數
````

## 當前變形矩陣(CTM)與變形前後向量座標的關係

這邊我們實際用矩陣來表示CTM的組成:

````
a(m11) c(m21) e(dx)

b(m12) d(m22) f(dy)

0   0   1   
````

假設今天我們要透過改寫CTM來引導Canvas的變形，則CTM與任意一個像素(Xi,Yi)的關係就如下圖：

> 舊像素座標陣列  =  CTM * 新像素座標陣列

![img](https://i.imgur.com/6jP31jy.png)

這邊我們可以發現一個有趣的點，那就是CTM竟然是放在等號後面的，這意味著若我們已知變形前座標和CTM的陣列值，我們其實就可以透過解二元一次聯立方程式來取得變形後座標。

就像這樣:

````
Xin*a+Yin*c+dx = Xip
Xin*b+Yin*d+dy = Yip
````
## 當前變形矩陣(CTM)與變形的計算方法

我們前面有提到過Canvas的變形運算其實就是簡單的矩陣乘法，假設我們今天令一個canvas先後做了兩次Transform

CTM的初始值:

````
1 0 0
0 1 0
0 0 1
````

第一次Transform使用的a,b,c,d,e,f 值：

````
1  -0.5  30
0.5  1  10
0    0   1
````

第二次Transform使用的a,b,c,d,e,f 值：

````
1  -0.5  30
0.5  1  10
0    0   1
````

則最終CTM將會變成一二兩次Transform陣列的乘積：

````
0.75 -1  55

1   0.75  35

0    0    1
````

# 小結

雖然說大部分人可能會覺得變形只是一種稀鬆平常的電腦繪圖操作，但是我覺得它背後的數學運算相當的有趣。  

除此之外，雖然這次介紹的部分可能稍微比較需要花時間理解，而且在大部分的2D渲染案例，我們也比較少會需要理解到這麼深，但是未來若是要學習webgl環境的渲染編程，陣列運算會是相當重要的一環。  

所以還是老話一句『學了不虧』～





