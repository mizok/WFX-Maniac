---
title: ES5/ES6學習筆記-ep1
categories: 
- 心得
tags:
- js
---

###### tags: `學習筆記`

## 搞清楚並且用最簡單的方法解釋js的apply/call/bind

- 先解釋apply/call
> apply/call 最簡單的解釋其實就是“把一個參數丟進去指定的函數裡面當this”
```javascript=
//假設有一個變數叫做qq, 初始值為'wow'
var qq = 'wow';
function poop(a,b){
    console.log(this,a,b);
}
poop.apply(qq);//wow undefine undefine
// 這邊其實就是把qq丟進去poop()裡面當作this, 用call 的話亦然
```
- apply和call的差別
> 雖然差別都是丟變數進去函數當this用，但是這兩個的差異在於支援參數不同
```javascript=
//apply的第一個參數傳入之後會變成函數中的this，但是第二個參數（必須要是array）傳入之後會變成函數原始支援的參數群
theFunction.apply(valueForThis, arrayOfArgs)
//apply的第一個參數傳入之後會變成函數中的this，但是第二個以後的參數就是函數原始的所有參數群
theFunction.call(valueForThis, arg1, arg2, ...)
```
```javascript=
 //以上面的poop()來看
 poop().apply(qq,[1,2])//'wow' 1 2
 poop().call(qq,1,2)//'wow' 1 2
```
- 解釋bind

> bind的用途跟apply/call 有點不同，他是會return 一個把指定變數綁進去當this的函數
```javascript=
function aa(a,b){
    console.log(this,a,b)
}
aa(11,22);//window 11 22 aa函數在沒被綁之前的this 都是window
var ccc=[1,2,3];
var gg = aa.bind(ccc);// 把ccc綁給aa之後重新包裝成一個gg, aa其實沒有被變動
gg(44,44)//[1,2,3] 44 44 從這邊開始this被綁死了

```
- bind 的進階用法
> 固定上層scope 的this，這個其實就是ES6 arrow function內部的做法
```javascript=
var a = {
    gg:'wow',
    ff:function(){
        setTimeout(function(){
            console.log(this.gg)
        }.bind(this))
    }
}

a.ff(); //wow
```


## 變數提升與let:

- 變數提升最基本的案例:
```javascript=
console.log(a)
//在"var a = 10" 之前去呼叫a, 其實會輸出undefine 而不是 ReferenceError: a is not defined.
//那是因為var 其實是先把a 在最開頭做一個宣告a為變數，然後最後才賦予值。
var a = 10

```

- 函數中變數提升的狀況:
    - 這個狀況:
    ```javascript=
        function test(v){
           console.log(v)
           var v = 3
        }
        test(10)
    ```
    - 其實等於這個狀況
    ```javascript=
        function test(v=10){
          var v;// 引入的參數其實也會在開頭被先宣告，而且宣告的優先權會比函數內部的變數宣告來得高
          var v;
          v = 10
          console.log(v)
          v = 3
        }
        test(10)
    ```

- let/const 與暫時性死區（Temporal Dead Zone）
    - 雖然let 可以用來避免用var產生的hoisting狀況，但是這並不代表let沒有hoisting行為
    - 在「提升之後」以及「賦值之前」這段「期間」，如果你存取它就會拋出ReferenceError錯誤，而這段期間就稱做是 TDZ，它是一個為了解釋 let 與 const 的 hoisting 行為所提出的一個名詞。
    ```javascript=
        let x = 'outer value';

        (function() {
          // 在函數的起始處會產生x的 TDZ起始點 x
          console.log(x) // TDZ期間存取，產生ReferenceError錯誤
          let x = 'inner value' // 對x的宣告語句，這裡結束 TDZ for x
        })()
    ```
    
## let與if的搭配

- 單行的if宣告不能在判斷boolean 之後let宣告

```javascript=
// 第一种写法，报错
if (true) let x = 1;

// 第二种写法，不报错
if (true) {
  let x = 1;
}
```

- 應該避免在塊級作用域內聲明函數。如果確實需要，也應該寫成函數表達式，而不是函數聲明語句。

```javascript=
// 塊級作用域內部的函數聲明語句，建議不要使用
{
  let a = 'secret';
  function f() {
    return a;
  }
}
// 塊級作用域內部，優先使用函數表達式
{
  let a = 'secret';
  let f = function () {
    return a;
  };
}
```

## const的重要意義 -- 固定傳址
> 大家都知道const 宣告的值就是不變的常數，但是實際上const最重要的應用點其實是在於固定變數儲存位置的地址

```javascript=
const a = [];
a.push('Hello'); // 可執行
a.length = 0;    // 可執行
a = ['Dave'];    // 錯誤，可以藉由這樣的方式避免a被換址

```
> 如果真的想將對象凍結，應該使用Object.freeze方法。
```javascript=
const foo = Object.freeze({});

// 常規模式時，下面一行不起作用；
// 嚴格模式時，該行會報錯
foo.prop = 123;
```




