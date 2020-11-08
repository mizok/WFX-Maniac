---
title: TYPESCRIPT學習筆記-ep2
---

###### tags: `學習筆記`

## 什麼是Interface(接口)?

> 簡單來說就是一個用來定義一個物件內部 必要變數/變數型別的寫法
> 好用的點在於可以去限制一個物件必須要具備什麼樣的property

```typescript=
interface LabeledValue {
  label: string;
  name?:string; //後面有問號的property代表是optional的項目
  readonly color:'red'
  //前面有寫readonly的property，
  //代表這個項目只要被interface初始定義之後就沒有辦法再被覆寫
  //注意readonly只能在interface裡面使用
}

function printLabel(labeledObj: LabeledValue
//直接把labeledObj 內容的型別定義為labeledValue 接口 
) {
  console.log(labeledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);
```

## 什麼是ReadonlyArray(唯讀陣列)?

> 用途是用來確保陣列被定義為唯獨之後再也不能被修改

```typescript=
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a;
ro[0] = 12; // error!
ro.push(5); // error!
ro.length = 100; // error!
a = ro; // error!
//但是可以用類型斷言強行複製
a = ro as number[];
```

## 我把函數的參數物件用一個具備optional屬性的interface來定義型別，然後我傳入不存在於該interface的property卻報錯了，為什麼?

```typescript
interface LabeledValue {
  name?:string; //後面有問號的property代表是optional的項目
}
//所以基本上這樣寫是合法的

let qq = (bb:LabeledValue)=>{
    
}
qq({})//傳入空物件

// 這樣寫也是合法的
let apple:LabeledValue ={};
apple.name = 'fuji';


//但是這樣寫就會fail
apple.color = 'red';

```

這說明了optional屬性只能接受"存在"或“不存在”這兩種值，用一個本來就不符合interface的property是不合法的



