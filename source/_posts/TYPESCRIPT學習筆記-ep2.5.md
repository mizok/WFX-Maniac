---
title: TYPESCRIPT學習筆記-ep2.5
categories: 
- 前端技術學習心得
tags:
- ts
---



#### 如何使用interface 為函數定義參數型別與回傳值型別

``` typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
} // 定義函數參數/return 的方式

interface customVariables {
  variableA: boolean;
}
```

#### 如何使用interface 定義"可索引類型"

```typescript=
interface arrayType {
  [index: number]: string;
} // 意思指的是[]內只能輸入數字, 並且return 值為字串

interface readonlyArrayType {
  readonly [index: number]: string;
} // 與readonly屬性的搭配應用方式, 這樣就可以把陣列轉為唯讀陣列

// 問題狀況
interface arrayType {
   [index: string]: number; //當索引值的型別是字串時會有一種特殊的問題, 會強制要求內部的變數型別跟這邊定義的一樣
  value:string // 所以這樣會報錯 (必須是number)
} // 當已經使用了strinf索引類型的定義時, 會強制要求回傳值是索引類型定義中的那個回傳值型別



```

#### 使用implement 將class與 interface 對接

```typescript

interface ClockInterface {
    currentTime: Date;
    setTime(d: Date): void;
}

class Clock implements ClockInterface {
    currentTime: Date = new Date(); //如果class裡面沒有寫這個變數就會報錯
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
}

```


#### 如何快速定義一個class的constructor 參數型別與其建立出來的實例型別？

```typescript=
//建議直接使用表達式
interface ClockConstructor {
  new (hour: number, minute: number); //定義ctor 參數內容
}

interface ClockInterface {
  tick(); // 定義實例內容
}

const Clock: ClockConstructor = class Clock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {

  }
}
```



#### interface也可以extend

> 實際使用起來就跟class的extend 差不多

```typescript=

interface Shape {
    color: string;
}

interface Square extends Shape {
    sideLength: number;
}

let square = <Square>{};  
// 這邊也可以寫成 let square:Square = {color:'blue',sideLength=10}, 但如果不寫預設值就會報錯
square.color = "blue";
square.sideLength = 10;
```

#### interface extend class？ 用意是什麼?

```typescript=
class Control {
    private state: any;
}

interface SelectableControl extends Control {
    select(): void; // 這邊定義了一個extend了 control的接口, 所以意思是說，如果今天有class想要implement 這個接口，他必須要有control 的全內容, 不然就會報錯
}

class Button extends Control implements SelectableControl {
    select() { } // 因為button 有 extend Control, 所以他本身就具有private 的state, 所以這樣給過

class TextBox extends Control {
    select() { }
}

// Error: Property 'state' is missing in type 'Image'.
class Image implements SelectableControl {
    select() { }
    // 因為Image 本身沒有private 的state, 所以不能implement SelectableControl
}


```