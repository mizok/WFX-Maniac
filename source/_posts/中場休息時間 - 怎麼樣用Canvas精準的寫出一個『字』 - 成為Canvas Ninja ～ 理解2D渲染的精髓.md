---
title: Day19 - 中場休息時間 - 怎麼樣用Canvas精準的寫出一個『字』 - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

呃，首先呢~

敝人小弟在下我今天仔細的*思考*了一下，決定這次還是再來一篇『`中場休息`』科普文，等到明天再來繼續`磁力/引力`的部分

> 其實是因為剛好工作應接不暇來不及寫新的案例 = = （噓
# Canvas文字的藝術

這次的`中場休息系列`，我們要來探討的是要怎麼樣在`Canvas`上面繪製`文字`。

講到這邊大概有很多人會覺得`超級莫名其妙`:

> 阿不就是用ctx.fillText就解決了嗎? 還要討論什麼?

不要急嘛。  

通常初次使用fillText，正常人應該會很直觀的就這樣寫:

````javascript
function text(ctx,textSource){
  ctx.font = '50px serif';
  ctx.fillStyle="black";
  ctx.fillText(textSource,0,0);
}

(()=>{
  const ctx = document.querySelector('canvas').getContext('2d') ;
  text(ctx,'TEST')
})()
````

> 接著打開瀏覽器，然後就發現螢幕上面什麼都沒出現 ~

![img](https://i.imgur.com/iGv3ffP.png?1)

為什麼？看起來該做的都做了啊，怎麼什麼都沒長出來？  

其實第一個原因就在於`ctx.fillText`的第2 、 3個參數，這個x = 0, y = 0的基準點，其實預設並不是從該行`文字`的`左上角`作為頂點起算，而是從`左下角`起算。  

有些人接著說，『那這樣是不是我隨意地給`Y`一個足夠大的數值，就可以了？』

> OK~那就改成這樣

````javascript
function text(ctx,textSource){
  ctx.font = '50px serif';
  ctx.fillStyle="black";
  ctx.fillText(textSource,0,50);
}

(()=>{
  const ctx = document.querySelector('canvas').getContext('2d') ;
  text(ctx,'TEST')
})()
````

![img](https://i.imgur.com/H1QDj8G.png?1)

文字這樣就出來了~!這樣就可以打完收工了嗎?! YAH! 今天真是EASY!  

**『錯誤。』**

這邊很明顯的`問題`就是`50` 這個數字是我們隨便亂給的，實際上你並不知道Y應該要給多少才能夠`完整`且`剛好`的把文字show出來。

> 那麼應該怎麼做呢?

請使用`ctx.textBaseline` 這個屬性，`ctx.textBaseline`是用來決定要把文字哪一處作為`垂直渲染基準線`的`property`，而當我們把`ctx.textBaseline`設定在`top`的時候，文字就會以上緣作為`垂直渲染基準線`，這樣就可以看到我們繪製的文字了~。

> 延伸閱讀: MDN 上的 ctx.textBaseline： https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline

而既然我們提到了`垂直渲染基準線`，那肯定就也有`水平渲染基準線`的設置方式～  
那就是`ctx.textAlign`，這個的用法其實就跟`css`差不多～

> 延伸閱讀: MDN 上的 ctx.textAlign： https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign


那今天就到這邊了嗎 ~ 好像也不怎麼難嘛哈哈~

**『錯誤。』**

眼比較尖的人可能會注意到～我們用fillText寫出來的字，好像跟一般html打出來的文字比起來:

> 就是有那麼一點*糊糊*的

到這邊可能就有些人開始翻文件找是不是有什麼`反鋸齒`啦～提升`解析度`的`property`~但是在找了一陣子之後才發現*根本不如所想*，接下來可能就開始懷疑是不是`硬體效能`問題。

> 咦？你說我怎麼知道你心裡在想什麼? 那當然是因為小弟我第一次用fillText時就是撞死在這面牆上 ：Ｐ

不知道大家還記不記得我們在這個`系列文`初期的時候有提到過：『一張寬度100px, 高度100px的canvas，它實際上就是100\*100 = 10000個像素的集合體』。

> 記得啊。然後呢？

其實，瀏覽器畫面本身也可以看作是一個比較大號的`Canvas`，但`唯一不同的點`就在於它的`像素密度`可能比一般的`Canvas`
還要高。  

為什麼說『可能』呢，原因其實就是我們剛剛提到的`硬體差異`。  

一般來說，如果使用者的電腦螢幕是`Retina`螢幕，或是其他類型的`高解析度`顯示器，他的螢幕像素密度會是一般顯示器，或是`Canvas`的`2倍`以上。

這就意味著在同樣`100x100`範圍中繪製的文字，`高解析度顯示器`的瀏覽器畫面實際上是顯示了至少`20000`個像素，這就導致用`DOM`渲染的文字，畫質遠比用`Canvas`渲染的文字來的清晰。

但是這個狀況當然也有解決辦法，那就是**強制對Canvas進行壓縮處理**。

還記得我們之前有提到過用css的方式去擴大Canvas的尺寸會導致像素密度變低嗎? 這邊我們就是要逆轉這個現象，首先把`Canvas`的width/height屬性都提高`N`倍，然後再用`css`去把style的width/height再縮減`N`倍。

這麼一來，像素的密度就直接被提高`N`倍了。

接著可能有人會問：

> 有沒有辦法求得N實際上應該要給多少才夠呢，給太大也不好吧?

這時候就該`Window.devicePixelRatio`這個`property`登場啦~  

> 延伸閱讀: MDN上的Window.devicePixelRatio： https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio

`Window.devicePixelRatio`這個`property`就是可以用來偵測當前的顯示器像素密度值，例如，`Macbook Pro` 的`Retina`螢幕的這個值會是`2`，而其他種類的顯示器也有不同的值。

妥善的運用`Window.devicePixelRatio`，我們就可以在`Canvas`上畫出跟`Dom`渲染文字具有同等水平解析度的文字~

到這邊為止，我們已經學到怎麼用Canvas去畫一行`清晰的文字`，但是實際上我們今天的內容~

**『還沒有結束。』**

我們今天的目標是「用Canvas精準的寫出一個『字』」，但是我們從剛剛到現在，其實都還是在一張固定大小的`Canvas`上繪製文字。

試想今天如果有一個需求：『如果我需要用`Canvas`去畫一個字，而畫好字的`canvas`，他的`長寬尺寸`要完全貼合這個畫出來的字，要怎麼辦？』

碰到像這樣的狀況，就代表著我們需要獲取『字』的『高度』/『寬度』等數據。

這時候可能就會有人懷疑:

> 有可能取得這些東西嗎? 我在用DOM渲染文字的時候從沒聽說過有這種數據可以取得

基本上，`api`其實都是應運需求而生的，而在`canvas`的世界中，想要去獲取當下所渲染出來的一個文字的高度/寬度，當然也是合情合理~

這邊要登場的就是`ctx.measureText()` 這個`api`

> 延伸閱讀: MDN上的ctx.measureText： https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText

這個`api`的用法就在於可以傳入一個`字串`，然後他就會根據當前ctx的`font`屬性設置的字體大小等參數，來回傳一個`TextMetrics` 物件。

什麼是`TextMetrics` 物件？ 這是一種包含了`ctx`環境下渲染`某字串`的各項`視覺數值`的一個物件，除了基本的`長寬`，還能透過部分數值計算出很多人在菜鳥時期可能都想要計算過的`文字實際高度`(就是文字實際具有顏色的部分所佔的高度，不含行高, X高~!)

> 延伸閱讀: MDN上的TextMetrics物件介紹： https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics

![img](https://i.imgur.com/j5eaNRf.png)

透過上述的方法，我們其實就可以利用`Canvas`做出近似用`DOM`渲染的文字，這樣做的好處就是我們還可以對這樣的`Canvas`文字作進一步加工! 例如`填充漸層`、`填充素材圖樣`，甚至可以做出`文字變形動畫`！(然後再把做好的Canvas轉成inline-block)當成行內元素塞到其他元素當成段落文字的一部分）

# 小結

以上就是我們`第二篇`的`中場休息`系列文，雖然是有點想放一些實作的案例，但是礙於時間問題沒有完成(之前是有在公司專案實作過用Canvas做漸層文字的IE11 PolyFill~效果真的不錯)，總之還是希望大家喜歡這次的科普介紹~