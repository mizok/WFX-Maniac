---
title: ES6學習筆記-Proxy 用途/介紹/使用情境
categories: 
- 前端技術學習心得
tags:
- js
---



## 什麼是Proxy

> 字面上的意思就是"代理" [color=red]

- Q1: 所以說是要代理些什麼東西啊?
- A1: 所謂的代理, 就是在要去代理一個物件內部 的 <屬性的存取>。過程中Proxy的作用方式，
有點像是去形成一個攔截屏障，所有要存取目標物件的程序都需要去通過這層屏障才能完成存取，所以說這層屏障的用途就在於偵測屬性的被存取

**這邊是一個利用Proxy去為一個空物件撰寫getter/setter的範例**

````javascript
var obj = new Proxy({}, {
  get: function (target, propKey, receiver) {
    console.log(`getting ${propKey}!`);
    return Reflect.get(target, propKey, receiver);
  },
  set: function (target, propKey, value, receiver) {
    console.log(`setting ${propKey}!`);
    return Reflect.set(target, propKey, value, receiver);
  }
});
````


## Proxy 的基本語法

````javascript
let p = new Proxy(target, handler);
````

- 其中 **target** 是一個目標的物件（雖然說是物件，但是它實際上也可以是array/function，甚至是另外一個proxy）
- **handler** 也是一個物件，但是他裡面的屬性  是proxy攔截(trap)到屬性存取行為時可以使用的函數。
- 基本上，我們在定義handler的時候並不是直接給一個有很多自訂名稱的方法的物件。
- handler裡面可以定義的方法有下面幾種(共13種)：

    - **get(target, propKey, receiver)**：攔截對象屬性的讀取，比如proxy.foo和proxy['foo']。
    - **set(target, propKey, value, receiver)**：攔截對象屬性的設置，比如proxy.foo = v或proxy['foo'] = v，返回一個Boolean。
    - **has(target, propKey)**：攔截propKey in proxy的操作，返回一個Boolean。
    - **deleteProperty(target, propKey)**：攔截delete proxy[propKey]的操作，返回一個Boolean。
    - **ownKeys(target)**：攔截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循環，返回一個數組。該方法返回目標對象所有自身的屬性的屬性名，而Object.keys()的返回結果僅包括目標對象自身的可遍歷屬性。
    - **getOwnPropertyDescriptor(target, propKey)**：攔截Object.getOwnPropertyDescriptor(proxy, propKey)，返回屬性的描述對象。
    - **defineProperty(target, propKey, propDesc)**：攔截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一個Boolean。
    - **preventExtensions(target)**：攔截Object.preventExtensions(proxy)，返回一個Boolean。
    - **getPrototypeOf(target)**：攔截Object.getPrototypeOf(proxy)，返回一個對象。
    - **isExtensible(target)**：攔截Object.isExtensible(proxy)，返回一個Boolean。
    - **setPrototypeOf(target, proto)**：攔截Object.setPrototypeOf(proxy, proto)，返回一個Boolean。如果目標對像是函數，那麼還有兩種額外操作可以攔截。
    - **apply(target, object, args)**：攔截Proxy 實例作為函數調用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(.. .)。
    - **construct(target, args)**：攔截 Proxy 實例作為構造函數調用的操作，比如new proxy(...args)。

> MDN上面有更完整的說明 [color=red]
> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#Handler_functions


## 先來看個 Proxy 的基本演練

> source code from MDN [color=red]

````javascript
let handler = {
    get: function(target, name) {
        return name in target ?
            target[name] :
            37;
    },
    set: function(target, name, value) {
    if (name === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // The default behavior to store the value
    target[name] = value;

    // Indicate success
    return true;
  }
};

let p = new Proxy({}, handler);
````

這樣寫的話，當我們去執行console.log(p.abc),也就是去取用p的屬性值，就會觸發get function
而如果我們去執行p.abc = "123", 就會觸發set function，這就是最基本的handler.get和handler.set的運用

## 下週繼續: 常用的handler方法與他們的使用範例

### 1. handler.apply

基本上大家都知道apply就跟call 是類似的東西, 他們是被用來執行一個函數, 並且可以塞特定的變數(或array)進去函式作為 this 使用;
而當一個函式被帶入proxy建構式而建立起proxy物件的時候, 因為函式本身也是一種物件([見ＭＤＮ解說](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions), 所以這樣就會變成只要該函式被以任何一種形式(一般/call/apply)呼叫的時候就會觸發代理的apply

基本的型態是這樣(如下)

```javascript=

apply: function(target, thisArg, argumentsList)

```

這邊target 是被代理的函式, thisArg 則是當這個被代理的函數是被call或者apply所呼叫時填入的this , argumentsList則是這個函數在被呼叫時的參數群

### 2. handler.new

這應該也是蠻好理解的, 簡單來說就是當一個能被作為建構子使用的函數, 被以proxy代理, 這樣的話, 他在被new 產生實例的時候, 就會觸發construct;


基本的型態是這樣(如下)

```javascript=

contruct: function(target, args)

```

### 3. handler.defineProperty

這個就有點意思了,  handler.defineProperty 是proxy 用來代理 object.defineProperty的對應handler形式, 那什麼是object.defineProperty呢?
簡單來講, object.defineProperty就是去賦值給一個物件的prop, 或者是產生並賦值一個prop。
這聽起來似乎很像是set 或是 object['prop']=xxx 這樣的操作, 而的確object['prop']=xxx的背後就是用object.defineProperty做成的。

他正確的形式是像這樣寫的

```javascript=
Object.defineProperty(obj, prop, descriptor) 

```

這邊的obj就是 想要去賦值prop的物件,prop就是想要去改變的property, 而descriptor則是一個物件, 裡面預設包含：

```javascript=
{
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'value',
  get:()=>{}
  set:()=>{}
}
```

我們平常使用obj['prop']=value, 其實等同於是：

```javascript=
Object.defineProperty(obj, prop, {
enumerable: true,
  configurable: true,
  writable: true,
  value: 'value'
})
```

這邊enumerable的用途是決定是否放行Object.keys() 或 for...in loop 去遍歷到這個屬性
configurable代表的是這次操作之後能不能再重新用Object.defineProperty去改寫這個prop的descriptor
而writable則是決定這個prop可不可以被覆寫
get/set 基本上就是一般理解的get/set 函數。

之後有機會的話再來寫一篇心得探討Object.defineProperty的用途

那讓我們回歸到正題。

我們這邊講到的是用proxy 去代理物件時，利用handler 中的 defineProperty trap 去偵測defineProperty行為, 這應該就不難理解了
基本上只要是透過Object.defineProperty所做出來的操作, 全部都會觸發這個trap

所以,

```javascript=
obj['prop']=value //會觸發

Object.defineProperty(obj, prop, {
enumerable: true,
  configurable: true, 
  writable: true,
  value: 'value'
})  //會觸發

let a  = Object.prop //當然也會觸發

```

handler.defineProperty 的基本形式如下

```javascript=
defineProperty: function(target, property, descriptor)
```

唯一一個比較需要注意的點是, handler.defineProperty 必須要return 一個 boolean值（用來確定prop是否被正確define）, 不然會報錯


### 4. handler.set

set 基本上就跟一般認知的set 是一樣的東西, 簡單來說就是去設定物件prop的值, 和handler.defineProperty的差別在於, 用set 沒有辦法trap到利用Object.defineProperty 所做的操作

基本的set 形式為：


```javascript=
set: function(target, property, value, receiver) {}
```

這邊的target 就是被代理的物件
property則是想要被set 值的prop
value 是想要給予prop的值
receiver 這個比較 特別, 這個預設都是指向proxy 實例自己, 但是在某些狀況底下也可以是別的東西（這個後面再討論）


### 4. handler.get

跟handler.get 同理

get 的形式是

```javascript=
get: function(target, property, receiver) {}
```

和.set一樣, 最後必須要return true



## 什麼是Reflect 和 receiver?

### Reflect 

Reflect 實際上和Proxy 是互相獨立的feature，但是 Reflect 常常跟著 Proxy一起被使用
Reflect本身是一種 built-in Object (跟Math一樣), 裡面的method就跟proxy的預設 handler集一樣（名稱一樣, 但是各個函數內容稍微有點差異）

#### 什麼時候會用到Reflect

> 平常沒有用到proxy的時候(讓對物件的操作可以變成用refect的method來處理, 優點在於統一整體code的一致性)
```javascript=
'_secretDrink' in FooBar;
delete FooBar._secretDrink;
```
有了 Reflect 我們可以這樣做：

```javascript=
Reflect.has(FooBar, '_secretDrink');
Reflect.deleteProperty(FooBar, '_secretDrink');

```

> 當有用到proxy的時候
```javascript=

 const target = {
    get foo() {
        return this.bar;
    },
    bar: 3
};
const handler = {
    get(target, propertyKey, receiver) {
        if (propertyKey === 'bar') return 2;// 這邊透過reflect.get 將可以拿到handler.get 在特定條件下丟出來的值, 但是如果是直接透過target用特定key取值, 則會直接取用原生物件(非代理)的get func, 導致最後的到的值變成3
        console.log('Reflect.get ', Reflect.get(target, propertyKey, receiver)); // this in foo getter references Proxy instance; logs 2
        console.log('target[propertyKey] ', target[propertyKey]); // this in foo getter references "target" - logs 3
    }
};
const obj = new Proxy(target, handler); //
console.log(obj.bar); // 因為 obj是一個proxy實例, 所以取用.bar會觸發 handler.get
// 2
obj.foo;
// Reflect.get  2
// target[propertyKey]  3

```

從這個案例來看, 我們可以發現refect的用意就是要去取得"代理" 這一個目標, 確保可以使用到代理內部handler的get, 而不是去使用原生物件的 getter

### receiver

#### 什麼是receiver?

一般狀況下 receiver會去指向代理本身，比方說

```javascript=
get: function(target, property, receiver) {}
```

通常來講這個receiver 就會是指向使用了這個handler的代理自己, 但是有些狀況下並不是這樣的。

這邊不太好懂, 可以看這篇stackoverflow

https://stackoverflow.com/questions/37563495/what-is-a-receiver-in-javascript

```javascript=
var handlers = {
        get(target,key,context) {
            console.log(greeter === context); //true, this line added
            return function() {
                context.speak(key + "!");
            };
        }
    },
    catchall = new Proxy( {}, handlers ),
    greeter = {
        speak(who = "someone") {
            console.log( "hello", who );
        }
    };

// setup `greeter` to fall back to `catchall`
Object.setPrototypeOf( greeter, catchall );

greeter.speak();                // hello someone 發動greeter的speak方法, 很正常的拿到了 預設的 someone
greeter.speak( "world" );       // hello world 給予 world 這個字串參數, 也很正常的拿到了 hello world

greeter.everyone();             // hello everyone!


```

這邊的greeter.everyone是一個根本不存在的方法, 但是這邊被call了
這樣最後會跑去觸發到由setPropertyOf 繼承到的catchall(是一個proxy實例)的handler.get
在這種狀況下 get() 的receiver 參數就不會去指向 catchall, 而是指向greeter

### Proxy 實用的地方


#### 1. 實作單向 prop trap綁定


```javascript=
const inputState = {
    id: 'username',
    value: ''
}
const input = document.querySelector('#username')
const handler = {
    set: function(target, key, value) {
        if (target.id && key === 'username') {
            target[key] = value;
            document.querySelector(`#${target.id}`)
            .value = value;
            return true
        }
        return false
    }
}

const proxy = new Proxy(inputState, handler)
proxy.value = 'John Doe'

// 因為真的很基本, 就不特別解釋了
```

#### 2. trap呼叫無效/ 不存在方法的行為並throw error

````javascript
function Foo() {
  return new Proxy(this, {
    get: function (object, property) {
    // 用reflect.has 去判斷 object 是不是有那個key 值
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
      } else {
      //如果方法不存在, 那就return 一個攔截用的function
        return function methodMissing() {
          console.log('you called ' + property + ' but it doesn\'t exist!');
        }
      }
    }
  });
}

Foo.prototype.bar = function () {
  console.log('you called bar. Good job!');
}

foo = new Foo();
foo.bar();
//=> you called bar. Good job!
foo.this_method_does_not_exist()
// error 被攔截
//=> you called this_method_does_not_exist but it doesn't exist
````

#### 實作 interpolation

這個比較複雜，預計下週在補完