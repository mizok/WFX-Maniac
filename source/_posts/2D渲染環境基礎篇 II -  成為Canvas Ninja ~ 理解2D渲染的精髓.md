---
title: Day5 - 2D渲染環境基礎篇 II -  成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

## 何謂路徑？

要介紹路徑繪圖相關的api之前，必須要先理解什麼叫做『路徑』。  
有學過電腦繪圖軟體，例如Adobe Photoshop, Adobe Illustrator的同學可能對『路徑』這個詞相當的熟悉，同時也可能可以更快速掌握2D渲染環境路徑繪圖的概念，但是考量到大多數人都沒有美術學經歷背景，所以這邊還是簡單做點說明~


> 路徑是使用繪圖工具建立的任意形狀的曲線，用它可勾勒出物體的輪廓，所以也稱之為輪廓線。 為了滿足繪圖的需要，路徑又分為開放路徑和封閉路徑。 --維基百科

如果要白話一點的解釋『路徑(Path)』這個概念，可以想像成他是由一條透明的曲線所圈出來的一塊(非)開放區域，在canvas中我們可以利用(接下來會提到的)上色填充相關api為已經成形的路徑設定填充色(fill)/邊框色(stroke)。

有學過SVG相關知識的同學應該馬上就會發現這其實就跟SVG的Path 屬性是一樣的東西～沒錯，路徑(Path)其實是計算機繪圖領域的概念，並不是Canvas獨有的。

<img src="https://i.imgur.com/7TfVMlG.png" width="500">

(圖片說明：在上圖我們可以看到我們必須要先有一個葉子形狀的Path，然後接著才可以對這個Path施加Fill和Stroke)

接下來我們要藉由實作的方式來加速學習api的使用方式，藉由實際操作API來畫一條線/一個圓/一個不規則形狀來加深對API的認識。

在開始之前，有一個**特別需要注意的地方**，那就是『繪製路徑』這個行為過程其實有點類似於用筆尖在紙面上作畫。  
這個『筆尖』會是一個實際存在的座標(但是你看不到)，打個比方:假設我們現在畫了一段由A點畫向B點的路徑，那麼『筆尖』最後也會停在B上面。  
這時候要注意，如果沒有利用API去移動筆尖，而是直接在別的地方畫了一個新的形狀，那麼先被畫出來的形狀和後被畫出來的形狀就會產生多餘的連線。
    
## 來畫一條線看看吧!

  <p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="XWgeKoJ" data-user="mizok_contest" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/mizok_contest/pen/XWgeKoJ">
  canvas畫線</a> by mizok_contest (<a href="https://codepen.io/mizok_contest">@mizok_contest</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

## 起手式!

任何的路徑在開始畫之前，最好都要先使用ctx.beginPath()來宣告『嘿，我要開始畫路徑囉』;
然後在結束路徑繪製時，也最好使用ctx.closePath() 來宣告結束路徑的繪製;

一般來說如果不宣告結束，那麼路徑就會一直存續下去，這樣就沒有辦法畫出個別獨立的圖形（例如個別獨立顏色不同的方塊）

另外一提，ctx.fill() (填充顏色的api) 本身自帶closePath的效果，所以如果先執行了fill()，則可以不用額外宣告結束路徑繪製。

## 接著來畫一個圓!

````javascript
// API 用法
void ctx.arc(x, y, radius, startAngle, endAngle [, counterclockwise]);
// x: 圓心X座標
// y: 圓心Y座標
// radius : 半徑
// startAngle: 起始角度=> 記得是順時針為正喔(而且必須要是徑度量)
// endEngle: 結束角度=> 記得是順時針為正喔(而且必須要是徑度量)
// counterClockwise : 是否以逆時針方向作畫
````

這邊我提出了一個錯誤的範例，和一個正確的範例，讓大家可以參考一下錯誤的原因和正確的寫法。

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="RwgLGPQ" data-user="mizok_contest" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/mizok_contest/pen/RwgLGPQ">
  canvas畫圓</a> by mizok_contest (<a href="https://codepen.io/mizok_contest">@mizok_contest</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

## 畫一個不規則形狀!

這邊我們利用畫二次曲線的API來畫一個由三條曲線構成的形狀，接著填充並且賦予框線。
這邊可以稍微理解一下Canvas 的API ～ ctx.curveTo是怎麼定義二次曲線的參數需求。
簡單來說這個api把一段二次曲線看作是一個由三個點所構成的曲線，三個點分別是：
- 開始畫線時筆尖的座標(第一端點)
- 曲線結束的端點座標(第二端點)
- 兩個端點沿著曲線拉出的切線所形成的交點，是為『控制點 cp』

<img src="https://i.imgur.com/zW0Biud.png" width="300">


````javascript
void ctx.quadraticCurveTo(cpx, cpy, x, y);
// cpx: 曲線控制點X座標
// cpy: 曲線控制點Y座標
// x: 曲線結束點Ｘ座標
// y: 曲線結束點Y座標
````

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="ExXwNZL" data-user="mizok_contest" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/mizok_contest/pen/ExXwNZL">
  canvas畫不規則形狀</a> by mizok_contest (<a href="https://codepen.io/mizok_contest">@mizok_contest</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

## Canvas Property的紀錄(save)與復原(restore)

我們在前面的三個範例都有去調整過渲染環境當前的fillStyle和 strokeStyle 來改變填充色和邊框的顏色。  
(有電腦繪圖經驗的同學可能很快的就注意到了--這兩個東西其實就是Illustrator的前景色和背景色吧!)
要知道，Canvas的Property在同一時間底下是只有一個唯一值的，也就是說填充色在同一瞬間只能被指定一個hex作為類似全域變數的概念，  
所以如果今天有一個需求，要先畫出一條紅色的線，接著再畫出一條藍色的線，流程便會是：
- 把fillstyle 設定成紅色
- 畫第一條線
- 把fillstyle 設定成藍色
- 畫第二條線

雖然這樣的場景很單純看起來沒什麼，但是如果今天到了很複雜的狀況，例如初始顏色是透過random函數隨機決定的，而繪製過程中突然有需求回歸原本random到的那個顏色，那就會需要有能夠復原Property的需求。

上述的場景雖然可以透過把字串值存取道臨時變數來達成，但是別忘了，Canvas 的Property 遠遠不止strokeStyle 一個，如果任何一個Property都要存一個變數，想必程式碼會變得很亂。

這時我們就可以透過Canvas 的原生API，也就是ctx.save()與 ctx.restore() (存檔與讀檔) 來達成上述需求。

這邊我提出了一個範例，範例中我先random 了一個hex色碼來作為初始顏色，畫一條線，接著把顏色改為藍色再畫一條線，最後我則是回歸原本ramdom到的顏色畫第三條線。


<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="PojJWaE" data-user="mizok_contest" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/mizok_contest/pen/PojJWaE">
  canvas畫不規則形狀</a> by mizok_contest (<a href="https://codepen.io/mizok_contest">@mizok_contest</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>


## 路徑繪製/上色 - 小結

實際上，canvas 關於繪製路徑的api還遠不止上述提到的這幾種。
例如曲線還有 ctx.bezierCurveTo()(貝茲曲線), 設定邊框粗細可以用 ctx.lineWidth, 設定端點類型可以用ctx.lineJoin...,etc

這些api/property 如果要在文章中一一介紹其實多少會變得有點流水帳，所以我比較傾向讓大家自己去搜尋自己需要的api

推薦在查詢api 的時候可以多使用MDN~ MDN 會是學習Canvas基礎的好幫手。

https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D



