---
title: Day6 - 2D渲染環境基礎篇 II [補充篇] -  成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

## 路徑繪製常令人感到疑惑的點 - 非零纏繞與奇偶規則

初學路徑繪製的時候，大部分人應該會發現一種讓人疑惑的狀況。

那就是當繪製的路徑稍微複雜一點且路徑線段產生交錯的時候，有些透過路徑線圍起來的區域，在發動ctx.fill()填充顏色
之後，仍然維持未填充的狀態。

之所以產生這種狀況的原因，是因為『你的大腦』和『程式邏輯』判斷封閉區域的規則不一樣。

而這篇文章的重點就在於講解『程式邏輯』判斷一個『路徑』是否存在『封閉區域』的判斷依據。

這個『判斷依據』一共有兩種模式，一種稱為『非零纏繞(Nonzero)』，另外一種則叫做『奇偶規則(Evenodd)』。

## 試著畫一個因為線段交錯而產生複雜封閉區的路徑

能最簡單體現這兩種判斷邏輯差別的方式就是畫兩個五角星，然後在ctx.fill()這個方法內導入填充模式的參數（也就是"evenodd" or "nonzero"）。

> ctx.fill() 的參數型別相關資訊可以看這篇MDN上的[介紹](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill)


<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="BaZmdOv" data-user="mizok_contest" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/mizok_contest/pen/BaZmdOv">
  非零纏繞與奇偶規則介紹1</a> by mizok_contest (<a href="https://codepen.io/mizok_contest">@mizok_contest</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

> 好啦, 我知道我的五角星很醜, 不要再嫌了

這邊我們可以發現，左邊evenodd規則所畫出來的圖形，中間並沒有被填滿，但是nonezero規則下的圖形卻是相反過來的狀況。

這是為什麼？ 接下來我們就是要來解釋這兩種規則的差異。

## 解釋非零纏繞與奇偶規則

非零纏繞(nonzero)、奇偶規則(evenodd) 其實是在電腦圖學一個很常見的概念(SVG也會牽涉到這兩個東西)，這兩種概念是用在“當判斷一個座標是否處於一個path內部時”，採用的兩種基準點。

<img src="https://i.imgur.com/uw1xKbU.png" width="400">

上圖是同一個path , 採用不同的規則時，在被Fill之後的樣子
我們可以看到這個path是由相同的一組編號1~5的向量線所形成的一個path。

基本上這兩種模式判斷的依據都是透過向量的改變狀況，還有向量的夾角來判定。

這邊我們先來複習一下高中的數學/物理～所謂的向量，指的是一種從座標A移動到座標B的附帶方向的移動量。
而『向量的夾角』指的則是兩條向量之前夾的最小角度(意思就是說『夾角』永遠是指小於180度的那個角)。

<img src="https://i.imgur.com/zeZZ9at.png">

另外還有一點略微重要就是夾角必須要是讓兩組向量從同一個座標點出發才能夠判定(像這邊的案例是透過把A向量拉出延伸)

<img src="https://i.imgur.com/dlxvUwK.png" width="400">

------------------------------------------------------

BTW，對高中數學還有印象的人可能還會記得這個公式～  

假設有一個向量圍成的三角形如下：

<img src="https://i.imgur.com/QPXKWpb.png" width="400">

如果我們要求取AC向量和AB向量的夾角，則可以透過這個公式來求得


<img src="https://i.imgur.com/POHe4mc.png" width="400">


接下來我們看看兩種規則是怎麼透過向量夾角機制來判定封閉區域是否存在


###  非零纏繞(nonzero)

<img src="https://i.imgur.com/ftLWrMo.png" width="400">  


由點A向外隨便一個方向拉一條無限延伸的線(淡藍色的線)，當這條線和1~5編號的向量交接時，若交接的夾角是呈逆時針，則-1，若為順時針則+1，最後的總和若不為0，代表點A在Path內部(也就是說A在一個封閉路徑內部)，若為0則反之。

### 奇偶規則(evenodd)

<img src="https://i.imgur.com/QT1XMRn.png" width="400">  


由點A向外隨便一個方向拉一條無限延伸的線(淡藍色的線)，當這條線和1~5編號的向量交接時，每碰到一條線就+1,
最後的總和若為奇數，代表點A在Path內部(也就是說A在一個封閉路徑內部)，若為偶數則反之。


## 小結

一般來說，大部分情況下evenodd的填充方式不會去涵蓋到shade region
(就是容易因為模式改變而轉變為 開放/封閉 區域 的地方)。

所以當我們想要用path去畫一個鏤空的圖形，一般會先把fillRule 改成evenodd。

**但是**，evenodd & 鏤空 這兩件事其實不是充要條件，而是就統計學上來講，evenodd模式容易創造出比較多的鏤空區。

根據繪製路徑的細節，nonzero模式同樣也可能創造出鏤空區。例如下面這個案例。

> 這個路徑是以nonzero方式填充，但卻仍然有鏤空區存在。

<img src="https://i.imgur.com/6YbkadA.png" width="400"> 



