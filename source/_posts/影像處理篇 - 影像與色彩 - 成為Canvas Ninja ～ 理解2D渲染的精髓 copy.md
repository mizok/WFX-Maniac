---
title: Day 23 - 影像處理篇 - 影像處理基礎 - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---


老實說我決定要寫`影像處理`這個部分的時候還蠻猶豫的，因為在javascript 做影像處理的這個領域，IT邦之前其實就有蠻多寫的蠻不錯的文章。

例如`第11屆鐵人賽` , [lb01910483](https://ithelp.ithome.com.tw/users/20121089/ironman/2838?page=3)大大寫的 [用 Javascript 當個影像魔術師](https://ithelp.ithome.com.tw/users/20121089/ironman/2838?page=3)。

不過既然都決定要寫了，那我也只能盡力去把這個章節寫完XD

話不多說，就讓我們開始吧。

# canvas的影像處理基礎

大家不知道還有沒有印象我們在前些時候有講過`canvas`的像素操作(pixel manipulation)。

我們之前有講過`canvas`的`imageData`的提取方法，也有提到過最一個基本的像素處理案例實作：『拼字圖畫』。

相信之前有讀過我們的`像素操作`教學文的人應該已經對我們接下來要講的東西都有了一些基本的概念~

> 沒讀過或不熟的同學可以再回去讀一讀喔~之前的文連結在這邊: https://ithelp.ithome.com.tw/articles/10270233

我們在這一篇會先來簡單的熱個身! 從一些簡單的`影像處理`技術開始講解 ~

# 簡易影像處理技術實作一 : 彩色轉灰階

其實這個技巧我們在像素處理那篇有用過，但是當時並沒有很清楚地提出來講～

彩色轉灰階的原理其實很簡單，就是單純的把RGB channel 的值取平均

就像下面這樣:

````javascript
function turnImageDataIntoGrayscale(imageData){
   let data = imageData.data;
   for(let i=0;i<data.length;i = i+4){
     let r = data[i];
     let g = data[i+1];
     let b = data[i+2];
     //取得rgb值得平均, 如此一來因為rgb都變成同一個數值
     // 圖像就會變成灰階圖
     let average = (r+g+b)/3
     data[i] = data[i+1] = data[i+2] = average;
   }
  return imageData;
}
````

> 可能有些人會有點納悶，為什麼取平均就會變成`灰階圖`呢? 其實可以稍微回憶一下每次在寫css要用灰階色時，灰階系列的顏色基本都是rgb為相同數值的組合(例如#333 就是rgb(51,51,51))~


# 簡易影像處理技術實作二 : 反相

反相顧名思義就是把色相(Hue)顛倒過來，而實作的方式很簡單，就是直接用255去扣掉當前的channel值就可以了

````javascript
function turnImageDataIntoGrayscale(imageData){
   let data = imageData.data;
   for(let i=0;i<data.length;i = i+4){
     let r = data[i];
     let g = data[i+1];
     let b = data[i+2];
     

     data[i] = 255 - r;
     data[i+1] = 255 - g;
     data[i+2] = 255 - b;
     
   }
  return imageData;
}
````

在上面兩個案例中，也就是`灰階化`和`反相`，他們其實都是對`色相(Hue)`、`彩度(Chroma)`、`明度(Value)`的一種操作。  

`色相(Hue)`、`彩度(Chroma)`、`明度(Value)` 在`美術領域`的`色彩學`中並稱`『色彩三要素』`，意思是說只要透過調節這三種要素的數值/占比，就可以產生任意顏色。  

而在`電腦編程`的世界中，我們平常在寫`樣式`的時候通常是用到`HEX色碼`或者是`RGB(A)制`的顏色，但是其實還有另外兩種我們比較不常用到的格式，那就是`HSV`和`HSL`，這兩者的`H`和`S`代表的都是`Hue(色相)`和`Saturate(飽和度)`，`HSV`的`V`是`Value(明度)`，而`HSL`的`L`則是`亮度(Ligntness)`

- `Hue(色相)` : 基本上跟`色彩學 - 色彩三要素`的`色相(Hue)`無異。
- `Saturate(飽和度)`: 跟`色彩學 - 色彩三要素`的`彩度(Chroma)`有直接關係，但是不是等價，除此之外`HSL`和`HSV`的`S`計算方式略有不同。
- `Value(明度)`: 跟`色彩學 - 色彩三要素`的`明度(Value)`有直接關係，但是不是等價。
- `亮度(Ligntness)`: 雖然名稱不同，跟`色彩學 - 色彩三要素`的`明度(Value)`反而比較接近。

![img](https://i.imgur.com/LUfWBVU.png)

> 圖片來自 維基百科

從上圖我們可以看出`HSL制`和`HSV制`的差別主要就在於表示色彩亮度的`Ｚ軸`部分(`HSL`會隨著`L`值的增加而變得更趨近於`白色`，但是`HSV`不會)

> RGB與HSL/HSV 的相互轉換方法 可以讀這篇 ： https://www.itread01.com/content/1549753775.html

下一篇開始我們會實作一些比較有趣的實作，還是老樣子各位敬請期待 :D