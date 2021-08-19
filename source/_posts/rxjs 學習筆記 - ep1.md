---
title: rxjs 學習筆記 - ep1
categories: 
- 前端技術學習心得
tags:
- js
- rxjs
---

# Opening

前陣子講了很久要來學習RxJs, 但是實際上卻是拖到了現在才要認真開始把它學好~
事不宜遲，我們這邊就馬上開始基礎的部分

# Preface

首先，我們先來說說為什麼要學`rxjs`, 平常寫前端UI真的有常常需要用到這東西嗎?

之前偶爾有聽說`RxJs`可以用來做高頻率事件的監聽與處理(例如`mousemove`或`touchmove`), 但是這跟一般的`addEventListener` 或 `jquery` 的`.on` 方法又差在哪裡? 有必要為了一個高頻事件處理去特地學這麼一個看上去很複雜的東西嗎?

實際上，如果只是要處理高頻事件監聽，確實是沒有需要特地去學習`Rxjs`。
但是`Rxjs` 其實並不是一個只能用來做高頻事件監聽控管的library。

Rxjs最重要的意義之一就是`Reactive Programming`，也就是`當變數或資源發生變動時，由變數或資源自動告訴我發生變動了`。

Rxjs 把很多東西都當成Reactive的對象, 除了前面提到的高頻事件的event object，另外也可以把單純的變數(物件/數值等)作為reavtive對象, 而這個概念也就是所謂的 `Observable`。



