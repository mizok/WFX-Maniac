---
title: ES5/ES6學習筆記-ep2
---


###### tags: `學習筆記`

## ES6解構賦值重點整理
1. 模式匹配：
> 只要等号两边的模式相同，左边的变量就会被赋予对应的值。

> - 這個
    let [a, b, c] = [1, 2, 3];

> - 等同於這個
    let a = 1;
    let b = 2;
    let c = 3;
    
> - 這個
    let [foo, [[bar], baz]] = [1, [[2], 3]];

> - 等同於這個
    let foo = 1;
    let bar = 2;
    let baz = 3;

> - 如果解構不成功，變量的值就等於undefined。
    let [foo] = [];
    let [bar，foo] = [1];
    以上兩種情況都屬於解構失敗，foo的值都會等於undefined。
    
> - 解構賦值的等號右邊必須要是一個可以迭代的東西，如果不是的話會報錯
    let [qoo]=null //報錯
    
> - 支援預設值，但也只有遇上對應的子項為 undefined才會採用預設值
    let [foo = true] = [];
    foo // true
    let [x, y = 'b'] = ['a']; // x='a', y='b'
    let [x, y = 'b'] = ['a', undefined]; // x='a', y='b'
    let [x = 1] = [null];x // null 因為子項不等於undefined

> - 字串也可以做模式匹配
    const [a, b, c, d, e] = 'hello';
    會變成
    const a= 'h',
    const b= 'e'
    ...

2. 對象匹配
    - Basic
    ```javascript=
    let { bar, foo } = { foo: 'aaa', bar: 'bbb' };
    foo // "aaa"
    bar // "bbb"

    let { baz } = { foo: 'aaa', bar: 'bbb' };
    baz // undefined
    ```
    - 如果變數的名稱與複製目標的屬性名稱不一樣的話可以這樣做
    ```javascript=
    let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
    baz // "aaa"

    let obj = { first: 'hello', last: 'world' };
    let { first: f, last: l } = obj;
    f // 'hello'
    l // 'world'
    ```
    - 對象匹配也可以有預設值，而採用預設值的標準跟模式匹配一樣:undefined
    ```javascript=
    var {x = 3} = {};
    x // 3

    var {x, y = 5} = {x: 1};
    x // 1
    y // 5

    //這個比較需要記憶
    var {x: y = 3} = {};
    y // 3

    //這個比較需要記憶
    var {x: y = 3} = {x: 5};
    y // 5

    var { message: msg = 'Something went wrong' } = {};
    msg // "Something went wrong"
    ```
    - 注意不要把大括號寫在行首
    ```javascript=
    {x} = {x: 1};//報錯
    //應該改寫成
    let {x} = {x: 1};
    //或
    let x;//這行不寫的話x 會變全域
    ({x} = {x: 1};)//這種方式盡量不要用
    ```
    - 函數參數的解構
    ```javascript=
    function add([x, y]){
      return x + y;
    }

    add([1, 2]); // 3
    ```
    
    - 函数参数的解构也可以使用默认值。
    ```javascript=
    function move({x = 0, y = 0} = {}) {
      return [x, y];
    }

    move({x: 3, y: 8}); // [3, 8]
    move({x: 3}); // [3, 0]
    move({}); // [0, 0]
    move(); // [0, 0]
    ```
    - 注意下列兩者的不同
    ```javascript=
    //函數參數本身附帶預設值
    function move({x = 0, y = 0} = {}) {
      return [x, y];
    }
    // 傳進來的物件會取代掉{}
    move({x: 3, y: 8}); // [3, 8]
    move({x: 3}); // [3, 0]
    move({}); // [0, 0]
    move(); // [0, 0]
    ```
    
    ```javascript=
    function move({x, y} = { x: 0, y: 0 }) {
      return [x, y];
    }
    // 傳進來的物件會取代掉{ x: 0, y: 0 }
    move({x: 3, y: 8}); // [3, 8]
    move({x: 3}); // [3, undefined]
    move({}); // [undefined, undefined]
    move(); // [0, 0]
    ```
3. 解構賦值的用途
    - 交換變數值
    ```javascript=
    let x = 1;
    let y = 2;

    [x, y] = [y, x];
    ```
    - 從物件/陣列 快速宣告多個值
    ```javascript=
    function example() {
      return [1, 2, 3];
    }
    let [a, b, c] = example();

    // 返回一个对象

    function example() {
      return {
        foo: 1,
        bar: 2
      };
    }
    let { foo, bar } = example();
    ```
    
    - 快速指定函數預設參數值
    ```javascript=
    $.ajax = function (url, {
      async = true,
      beforeSend = function () {},
      cache = true,
      complete = function () {},
      crossDomain = false,
      global = true,
      // ... more config
    } = {}) {
      // ... do stuff
    };
    ```
4. generator function(生成器函數)是什麼？

    - 在ES6中定義一個生成器函數很簡單，在函數後跟上「*」即可：

    ```
    function* foo1() { };
    function *foo2() { };
    function * foo3() { };

    foo1.toString(); // "function* foo1() { }"
    foo2.toString(); // "function* foo2() { }"
    foo3.toString(); // "function* foo3() { }"

    ```
    - 调用生成器函数会产生一个生成器（generator）。生成器拥有的最重要的方法是 next()，用来迭代：
    ```javascript=
    function* fibs() {
      let a = 0;
      let b = 1;
      while (true) {
        yield a;//碰到yield就會return 一個值
        [a, b] = [b, a + b];
      }
    }
    ```

