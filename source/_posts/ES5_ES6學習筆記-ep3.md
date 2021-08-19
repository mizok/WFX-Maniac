---
title: ES5/ES6學習筆記-ep3
categories: 
- 前端技術學習心得
tags:
- js
---



## ES6 Promise 重點整理
1. Promise 是什麼
 - 用來處理callback chain 的一種新JS語法
 - 本身是一個class, 但是他也有自己的靜態方法
 - 建立出來的實例物件具有三種狀態：pending/fulfilled/rejected
 - 狀態只可能是從pending 變成 fulfilled/rejected
2. promise.prototype.then()
 - then()可以傳入兩個函數作為參數，第一個函數會在promise物件被fulfilled之後馬上發動，第二個函數則會在promise物件被reject的時候馬上發動
 - 會回傳一個新的promise物件
 - **重要** ： 當then與then串接的時候，後面的then 的 **參數function** 會得到前面的then 的 **參數function** return出來的值作為參數
3. promise.prototype.catch()
 - catch()可以傳入一個函數作為參數，並且這個函數會接收到promise throw出來的error
 - 也會回傳一個新的promise物件
4. promise.all()
 - 也會回傳新的promise
 - 必須要傳入一個陣列，這個陣列本身的內容物都是promise
 - 當這些內容物promise都被fullfill之後，all()本身回傳的promise就會被fullfill
 - 在all() 回傳得到的promise後面去使用then(), 該 then()的參數function會拿到all()的所有內容promise 在resolve 時使用的參數 所組成的陣列。
5. promise.race()
 - 也會回傳新的promise
 - 必須要傳入一個陣列，這個陣列本身的內容物都是promise
 - 當這些內容物promise有其中一個被fullfill之後，race()本身回傳的promise就會被fullfill
 - 在race() 回傳得到的promise後面去使用then(), 該 then()的參數function會拿到race()的最快達成fullfilled 的內容promise 在resolve 時使用的參數。


