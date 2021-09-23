---
title: Day10 - 初次接觸物理模擬 - 彈跳球世界 - 成為Canvas Ninja ～ 理解2D渲染的精髓.md
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

OK, 我們終於來到了基礎篇最後的部分，也就是Canvas動畫~!(撒花)  
在這個部分，我們會介紹：
- `canvas`實作動畫的原理
- 一個簡易動畫的實作案例

# Canvas動畫原理

我們都知道，在現實生活中動畫(Animation)的原理其實是透過繪製很多不同但連貫的圖片，然後把這些圖片依序播放出來。  
`canvas`實作動畫的原理其實也是一模一樣。

假設今天有一個60FPS(Frame Per Second, 意思就是每秒60幀)的動畫，如果我們要用Canvas來實作，那麼在動畫第一秒內的流程大約會是：  

- 在canvas上面繪製第一幀的樣子
- 在1/60 秒後清除畫面
- 在canvas上面繪製第二幀的樣子
- 持續重複上面的做法, 一直做到第60幀
- ...

原理面的部分大致上就這樣，雖然看起來很簡單，但是在實作的時候才真的會遭遇到各種問題。

# 什麼是幀率（FPS）?

> 你前面提到了`FPS`這個詞，那是一個什麼樣的概念？

所謂的幀率就是『每秒被播出的圖像數量』。  

> 延伸資源：[不同幀率所帶來的視覺效果差](https://www.youtube.com/watch?v=npMreLeVD6o)

在過去的年代，製作一部手繪卡通其實所費不貲，最主要的原因就是因為圖像需要逐幀人工繪製，而專案限期內能繪製的圖像有限，所以一般來說手繪動畫的幀率相對來講會比較低。
以常見的日式動畫來講，日式動畫的幀率平均落在`23.976幀/秒`, 這也就是我們常聽到的`24幀`。

> 在現代則出現了更方便的AI中割模擬，大幅減少了人力成本，不過那是題外話了 。 BTW -- 有看**咒術迴戰**的朋友可能對`24幀`這詞蠻熟悉的XD(投射咒法~!)

而在科技進步之後，來到網頁 / 遊戲的領域，基本幀率則最少也會有`60幀/秒`（因為畫面是交由機器繪製）。  

這邊有人可能會開始覺得很疑惑，網頁在沒有動畫時，本身不是靜態的圖像嗎？為什麼還會提到幀率？  

這你就不懂了~  

瀏覽器視窗本身可以其實可以看作一個大型且複雜的canvas，你在一秒內所看到的畫面，其實實際上是瀏覽器渲染引擎以極快的速度逐幀繪製出來的(就算是靜態畫面也是一樣)

渲染引擎本身的繪製速度其實會受到編譯的速度，還有程序邏輯的複雜度等多重原因影響，而當渲染引擎的繪製速度被拖慢(或者說不夠快)，這時候就會出現所謂的`渲染延遲`，或`掉幀`的現象。

舉個常見的`渲染延遲`案例 ~ 大家在菜鳥時期一定都有碰過。當有一個網頁具備一卡車的動態特效(尤其是onScroll Animation) ，使用者在網頁載入完畢的同時快速把scrollbar往下拉，這時候畫面會有很大的機率會白掉一大半，這個就是『渲染速度』跟不上『使用者操作UI速度』的典型案例。

> 通常這種狀況的解決方式都是比較硬核的，需要深入程序修改細節以解決效能上的問題。

而所謂的`掉幀`，其實就是我們常說的動畫卡頓問題，網頁的`掉幀`問題有大有小，大的例如畫面卡頓卡到跟靜態圖像一樣，小的則像是某些時候畫面會有微妙的停頓感(一般人可能分辨不出來這個XD)

接下來我們會用實際範例來演示怎麼在Canvas環境下實現一個方塊移動的簡易動畫。

# 實際動畫案例演示 - 方塊移動

````javascript
const startTime = performance.now();
const durationTotal = 5000;

function drawRect(ctx,x,y){
  // 這就是很普通的畫一個方塊在指定座標的位置上
  // 假設長寬都是40
  const size = 20;
   // 設定填充色
  ctx.fillStyle="#fff";
  ctx.fillRect(x,y,size*2,size*2);
 
}

function animate(ctx){
  // 預設都先清除舊畫面然後重新畫一個方塊在新位置
  let timeNow = performance.now() - startTime;
  //
  const speed = 0.05; //假設速度是0.05px/毫秒
  
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
  drawRect(ctx,speed*timeNow,50);
  
  // 在目前花費時間還沒超過總預設花費時間的狀況下就持續動作
  if(timeNow<durationTotal){
    // 告訴瀏覽器下一幀要做的動作, 可以想像成一個極短的setTimeout, delay時間大約是1/60秒
    // 這邊我們透過遞迴執行animate來繪製下一幀的畫面
     requestAnimationFrame(()=>{animate(ctx)})
  }
  else{
    return
  }
}


function draw(){
  const cvs = document.querySelector('canvas');
  const ctx = cvs.getContext('2d');
  animate(ctx);
}


(()=>{
  draw();
})()
````

> codepen連結： https://codepen.io/mizok_contest/pen/qBjyVaa


在上面這個看似簡單的範例中其實隱藏著兩個重點。

- 用requestAnimationFrame(RAF)來告訴瀏覽器進行下一幀圖像的繪製
- 用performance.now()來追蹤動畫進行時間

接下來我們會就這兩個重點講解背後的原因。

# 為什麼要使用requestAnimationFrame()?

如果去找一些比較早期的Canvas教程，可能會發現它裡面都是用SetTimeOut 或是SetInterval去計算幀間時差(將時間設置為1000/60 毫秒) 。
雖然說用setTimeOut/setInterval 來計算幀間時差並不算錯，但是就是比較粗糙。
使用requestAnimationFrame(以下簡稱RAF)的優點有二：
- 不像setTimeOut/setInterval是固定給一個固定的時間差，RAF可以視為一個動畫幀結束之後的callback，所以相對的他比較不會受到幀率誤差的影響
- 不像setTimeOut/setInterval，RAF並不會在背景運作，當你把分頁切換到別的分頁，RAF就會被中斷，這個設計改善了瀏覽器運作的效能，同時也減少電源的消耗

# 為什麼要使用performance.now()?

我們先來說說`performance.now()`在這個案例裡面用途是什麼，還有他是一個什麼樣的api。

`performance.now()`簡單來說就是一個用來計算`document`生命週期的方法，他會在`document`物件被載入的時候開始計時。

有些人接著可能會問:

> 那他跟`Date.now()`差別差在哪？不能用`Date.now()`就好嗎?

`performance.now()`作為一個比較年輕的api，跟`Date.now()`比起來其實有更多適用的場景，原因有二：

- performance.now() 能夠提供超越毫秒的精準度，他所計算出來的時間會是附帶浮點數的毫秒，所以他更適合用在遊戲或動畫這種需要高精確度的運算場景
- Date.now()實際上是從1970年1月1日0分0秒開始估算(也就是所謂的Unix時間)，然而現今的年代其實很少需要一個從1970年開始計時的功能。而且Date實際上是會Base on 裝置的系統時間，當系統時間在某種狀況下受到變動，運用Date.now去計算時間差的Web APP 可能會出現誤差。

根據developers.google.com的解釋，Date.now比較適用在確認絕對時間的場景，而performance.now則適用於計算相對時間的情境。

> developers.google.com上關於performance.now的解釋可以看[這邊](https://developers.google.com/web/updates/2012/08/When-milliseconds-are-not-enough-performance-now)

看到這邊大家應該已經很能理解使用performance.now的諸多好處～

但是接著可能就又會有人再問：

> 那為什麼不能直接用經過的幀數作計算？例如預設一個變數給定總幀數，然後每一圈RAF就-1，扣到0的時候就停止運動?

原因很簡單～還記得我們前面有介紹過瀏覽器的FPS數字其實會受到其他因素的影響嗎？有時候如果FPS偏低，那麼就意味著可能有某幾幀的耗時比較長，這麼一來，如果用幀數來判斷移動距離，就會出現運動速度不均勻的狀況。  

雖然說在過去這種誤差可能不容易被察覺，但是在現代，尤其是在開發遊戲的場景，物件移動的精確度其實越來越重要，所以相對的也要求開發人員不能隨便用舊方法交差。


# 小結

這次我們介紹了如何在Canvas上實作動畫，但是這其實還是非常基本的部分，我們接下來即將要脫離基礎篇，正式來介紹一些比較複雜的Canvas應用場景~