---
title: Day15 - 中場休息時間 - 來看看htmlToCanvas的實作吧 - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

經過了連續`5`篇複雜度略高的`物理模擬`系列，我在想看官們多少會有點*疲乏*~

所以我在規劃了幾篇『`中場休息`』，用來穿插在主要的chapter之間，(休息是為了走更長遠的路～)

主要內容會講一些比較容易理解～一篇之內就可以講完的案例。  

這篇文是『`中場休息`』系列的`第一篇`文，我們這次會講講怎麼樣在Canvas上實作 html 轉圖像的功能。

# htmlToCanvas實作

大部分人提到htmlToCanvas的實作，應該會直接想到[html2Canvas](https://www.npmjs.com/package/html2canvas)這個著名的`NPM`包，但是我們秉持著`NINJA精神`當然不能*光會用別人寫的包*，所以我們就來看看這個案例的`實作原理`。

其實htmlToCanvas的實作在[這一篇](http://web.archive.org/web/20140901100550/https://developer.mozilla.org/en-US/docs/Web/HTML/Canvas/Drawing_DOM_objects_into_a_canvas)`MDN`的舊版文章(已經被封存)裡面有提到過做法。

這邊直接把源碼貼上來:

````html
<canvas id="canvas" style="border:2px solid black;" width="200" height="200"></canvas>
````

````javascript
var canvas = document.getElementById('canvas');
var ctx    = canvas.getContext('2d');

var data   = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
               '<foreignObject width="100%" height="100%">' +
                 '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
                   '<em>I</em> like <span style="color:white; text-shadow:0 0 2px blue;">cheese</span>' +
                 '</div>' +
               '</foreignObject>' +
             '</svg>';

var DOMURL = window.URL || window.webkitURL || window;// 這是一個防呆，因為不同瀏覽器的createObjectURL方法可能存在於不同對象底下。

var img = new Image();
var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
var url = DOMURL.createObjectURL(svg);

img.onload = function () {
  ctx.drawImage(img, 0, 0);
  DOMURL.revokeObjectURL(url);
}

img.src = url;
````

> codepen連結: https://codepen.io/mizok_contest/pen/RwgdpgR

在上面這個案例我們可以看到，html to canvas的實作流程大致如下:

1. 把dom element用 svg 的 `foreignObject` tag 塞到svg內部
2. 用`Blob`類的建構式去把svg字串轉換成`Blob`物件
3. 用`URL.createObjectURL(Blob)` 去取得轉化出來的`Blob`物件的`URL`
4. 把取得的URL作為src賦予給image，然後在image on load的時候用ctx.drawImage畫出來

這邊我們就每個步驟稍微說明一下～

## 為什麼要用foreignObject?

首先我們來講講`foreignObject` 是什麼。

有自己寫過`svg`的同學應該很清楚，svg的原生元素是**沒有辦法**做文字段落自動換行的，一般要換行的話，我們只能透過把斷行的部分寫成多個`<tspan>`，然後手動指定`tspan`的座標值(聽起來很笨，但是確實就是這樣)

> 延伸閱讀：tspan 在MDN上的介紹頁面： https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan

而`foreignObject`的存在意義其實就是可以讓我們在svg的`XML namespace(命名空間)`底下去把不同`namespace`的`結構語言`給渲染出來。

> XML 指的是結構性語言，html/svg都是一種XML，但是他們只能在特定的namespace底下被渲染，不同的namespace底下會有不同的渲染邏輯~

透過使用`foreignObject`把`html`的內容埋進去`svg`裡面，這樣我們就得到了一張具有`html`外觀的`svg`了~大概可以這樣理解。

## Blob 是什麼？為什麼要用它？

`Blob`其實是一種 `類檔案(File-like)`的`物件`。

舉個例來說～我們常常看到有些網頁會有利用`<input type="file">`做`檔案上傳`的功能，
這些`input`在on change時接到的東西其實就是`Blob`的一種。

而我們這邊則是透過手動把`svg`字串傳到`Blob`類的`建構式`，來建立一個全新的`Blob`實例。

````Typescript
new Blob(array, options);
````
`Blob` 的第一個參數固定要傳一個陣列，而陣列的內容可以允許傳入`字串`(也可以傳入其他的東西，可以讀MDN上的解釋)
後面的options

> 延伸閱讀: MDN 上關於 Blob（）的頁面:https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob

之所以用`Blob` 是因為後面需要用`createObjectURL(Blob)` 來取得`Blob`實例的URL。

> 延伸閱讀： MDN 上關於 createObjectURL(Blob)的頁面：https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL

如果不想要用Blob來取得`image src url`，其實也是可以直接把埋入`foreignObject`的`svg string`直接寫入`<img>`的`src` attribute，就像這樣:

````html
<img width="600" height="450" src='data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="100%" height="100%"><body xmlns="http://www.w3.org/1999/xhtml"><span style="color:red">123123123</span></body></foreignObject></svg>'>
````

## 小結

到這邊為止我們大概可以理解`htmlToCanvas`的實作，但是以實際場景來講其實很多時候不會像我們上面給的範例一樣這麼簡單。  
打個比方，例如典型的`跨域`問題，導致我們在程序中無法順利取得正確的`圖片/樣式表`，除此之外，因為為了要防堵資安漏洞，利用`foreignObject` 去取得`html`的渲染畫面這一操作其實有很多限制，例如:

-  只能使用內置樣式
-  不能在`foreignObject`中引入`js`文件，這意味著有些透過`js`生成的樣式變成需要手動賦予到`foreignObject`的`html`元素上
- ...,etc.

而為了應對各種複雜的`截圖`需求，才會有了`html2Canvas`這樣的插件，這個插件實際上是用了很多比較tricky的方法去繞過防堵機制來達成部分因為`上述限制`而難以實行的問題，但是也因為這樣這個插件當然也就會有被認定為`bug`的狀況。

到這邊為止是這次的`html2Canvas`實作介紹~希望大家喜歡 :D



