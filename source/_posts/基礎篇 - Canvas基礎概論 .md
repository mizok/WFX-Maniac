---
title: Day2 - 基礎篇:Canvas基礎概論 我要成為Canvas Ninja!
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

## Let's Start From Scratch

本系列文章的頭幾篇我決定還是帶點基礎的東西，所以首先，我打算介紹一些不常被一般教學提到的資料來當熱身。

> The HTMLCanvasElement interface provides properties and methods for manipulating the layout and presentation of `<canvas>` elements. The HTMLCanvasElement interface also inherits the properties and methods of the HTMLElement interface.  --- from MDN
> The HTML `<canvas>` element is used to draw graphics on a web page. --- from www.w3schools.com

上述是在MDN還有W3school上關於`canvas` 元素 的解釋。簡單來說`canvas`就是一種自帶複數api, 然後可以用來在網頁上做動態繪圖的元素。  
簡單的介紹就到這邊，接下來是疑問時間。  
有些人看到上述的解釋，可能會覺得很疑惑，例如：

> 那麼我們平常在用的CSS和html基礎元素，那樣子的東西難道不也是一種繪圖嗎? 差別在哪裡?

接下來我們將針對這個問題做一系列的說明。

## Canvas 與 一般 Dom元素的差異一：編譯流程

通常在80%以上的web專案內容中，我們都是使用普通的Dom元素來對頁面進行版面規劃。  
所謂『普通』的Dom元素指的就是 `div`、`span`、`ul`、`li`...,etc. 而我們都知道，`HTML`本身是一種標記語言，  
一篇完整的標記語言範本其實就有點像某種**願望清單**，為什麼說是願望清單呢? 那是因為瀏覽器在接收到一份HTML時，他做的事其實就是根據這份文件，上面提到的: 這份文件有多少元素? 元素個別是哪些？ 元素的先後排列順序、元素的巢狀化邏輯...etc. 去生成各個元素的物件實例，然後再透過瀏覽器的渲染引擎去把這些元素渲染在畫面上。

![retain mode](https://i.imgur.com/Ta8eGWm.png)


像這樣子先確認頁面需求模型(也就是我們提到的願望清單)，然後將模型中的細節一一轉譯實現的這種行為模式，我們把它稱為`Retained Mode`(保留模式)。  
接著一定就會有人問：  

> 那麼是不是還有別的模式呢？

Of course.  
當瀏覽器需要做這類把文字邏輯轉化成視覺的工作時(我們把這種行為稱為轉譯)，會有兩種固定模式，其一是`Retained Mode`(保留模式), 然後再來就是與`Canvas`密切相關的`Immediate Mode`(立即模式)。  

![img](https://i.imgur.com/d7l62h9.png)

從上面這張圖片我們可以發現，`Canvas` 元素和`Dom`元素最大的區別就是創建模型的這一個環節。  
所謂的模型指的其實就是彼此之間具有**關聯**的物件(`Object`)的群集。  
一個使用Canvas 畫一個藍色方塊，和一個使用`div`搭配`css`樣式做出的紅色方塊，本質上最大的區別除了顏色之外，就是這個方塊背後物件的內容差。  

舉個簡單的例子，我們在做網頁動畫的時候，常常會需要用到`getBoundingClientRect` 這個`api` 來獲取一個區塊的大小、座標等。  
而我們在使用這個api的時候，一般就是先去抓取(`query`)這個元素，然後就可以用這個元素實例底下的`api`。

````javascript
  // ele 本身是透過selector 字串所抓到的元素實例(instance), 這個實例其實是在瀏覽器創建Dom模型的時候new出來的
 let ele = document.querySelecor('div'); 
 // getBoundingClientRect 則是ele 這個實例物件的一個方法
 let divWidth = ele.getBoundingClientRect().width; 
````
上述對大部分人來說應該都是一個稀鬆平常的操作。
但是當我們用Canvas 繪製一個方塊時，我們所創建的實例並不是透過去`new` 瀏覽器內建的`Element` 類(`class`)所建立出來的，而是透過我們自己定義的一個具有客製化方法的類，例如:

```javascript
 class block{
   constructor(ctx){
     this.ctx = ctx;
   }
   draw(x, y, width, height){
     this.ctx.fillRect(x, y, width, height);
   }
 }
```
當我們用這樣的一個客製類`Block`去產生一個方塊的實例時，這個實例底下所有的方法，都是來自於這個客製類`Block`的定義（所以當然也就沒有`getBoundingClientRect`這麼方便的api可以用）。  
但是相對的，因為產生實例的類可以自己定義，自由度也當然就跟著大幅提高，平常一些不能用基礎Dom元素做到的操作，甚至都變得有可能了（ex：繪製不規則圖形、創作複雜動畫）

## Canvas 與 一般 Dom元素的差異二：使用情境

前面我們有提到, Canvas 相較於 基礎Dom元素而言，具有相對高（不只高! 而是非常高！）的自由度。  
用一個簡單的例子來描述，就好比**訂製手工賽車**和**國產普通轎車** 的區別，這邊絕對不是要說國產貨不好，畢竟我也沒有說訂製的手工賽車的來源是哪一家廠商XD  

講到這邊應該就可以理解到兩種繪圖方式的使用情境其分野：

#### 1. Dom元素適合的情境
  - 快速/大量生產的需求
  - 不想花費過多時間處理效能問題
  - 有大量的互動操作行為, 例如UI/UX

#### 2. Canvas渲染適合的情境
  - 當有天馬行空的創意
  - 較少的時間壓力，且能夠自行處理圖形重繪/ 效能問題
  - 像素操作（這個後面的章節會提到）

就像我們前面提到的，以現階段來講，前端工程師80%的職業生涯中面對到的多半是第一種情境(當然也有少數人不是)，  
而我們需要為了這20%的狀況去學習的原因，除了要應對未來的不時之需以外，當然就是有挑戰自我創作的意義存在。

那麼話就說到這邊。  
在接下來的章節，我們將會進入2D渲染的環節，首先當然還是會從2D渲染的基礎開始，然後再逐漸的解釋Canva繪圖的實作，還請各位拭目以待～。