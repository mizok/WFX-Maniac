---
title: TYPESCRIPT學習筆記-ep1
categories: 
- 前端技術學習心得
tags:
- ts
---




# TYPESCRIPT的基礎常識


## 基礎型別上與es5/es6 較有差異的部分
1. 數字
ts的數字另外有支援兩種格式：2進位＆8進位;除此之外,ts 的number同樣都是浮點數
```typescript=
let decLiteral: number = 6;
let hexLiteral: number = 0xf00d;
let binaryLiteral: number = 0b1010;
let octalLiteral: number = 0o744;
```

2. 陣列
```typescript=
//原則上ts的變數都要寫型別，而如果一個變數的型別是array
//且這個array的子項型別都是number，則可寫成如下
let list: number[] = [1, 2, 3];
```

```typescript=
//承上，或如下利用泛型
let list: number[] = [1, 2, 3];
```

3. 元組(陣列型別專用)

- 最基本的範例：
```typescript=
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error
```

- 為陣列編寫型別的好處

```typescript=
let x: [string, number];
x = ['hello', 10]; // OK
console.log(x[0].substr(1)); // OK 因為x[0]在元組中定義為字串，可以使用substr方法
console.log(x[1].substr(1)); // Error, 因為10屬於在元組中定義為數字，不能使用substr方法，所以會報錯
```

- 當偵測到陣列子項位置在元組定義範圍外的子項時，會用元組定義的型別的聯集來定義之

```typescript=
x[3] = 'world'; // OK, 字符串可以赋值给(string | number)类型

console.log(x[5].toString()); // OK, 'string' 和 'number' 都有 toString

x[6] = true; // Error, 布尔不是(string | number)类型
```

4. 列舉（Enumerate）

- 能夠把變數的範圍限制在某些限制下進行存取並賦予其定義

- 舉個實用的例子，團隊裡的後端在 Server 處理資料發生錯誤時，定義了一些代碼，來告訴前端說，這個代碼代表什麼錯誤，那個又是什麼：

```javascript=
const handleWrongStatus = (status: string): void => {
  switch (status) {
    case 'A':
      // Do something...
      break;
    case 'B':
      // Do something...
      break;
    case 'C':
      // Do something...
      break;
    default:
      throw (new Error('No have wrong code!'));
  }
};
```

然而像上面這樣寫的話，缺點會在於各個case之間沒有語意化，你很難去釐清Case A 實際上是什麼, Case B又是什麼，在這種狀況下就可以去使用enumerate

enumerate的寫法跟js的物件接近，如下

```typescript=
enum requestStatusCodes {
  error,
  success,
}
```

正常來講，如果不幫上述這個requestStatusCodes 的裡面每一個子項去做定義，TS的編譯器會直接把error的編號定為0, success的編號定為1（流水號）

這樣我們就可以透過requestStatusCodes.error拿到0這個列舉值, requestStatusCodes.success拿到1這個列舉值;或者透過requestStatusCodes[0]拿到error 這個列舉子項

這樣的話。上述的case switch就可以這樣改良

```typescript=
enum requestWrongCodes {
  missingParameter = 'A',
  wrongParameterType = 'B',
  invalidToken = 'C',
}

const handleWrongStatus = (status: string): void => {
  //es6解構賦值的寫法
  const { missingParameter, wrongParameterType, invalidToken, } = requestWrongCodes;
  switch (status) {
    case missingParameter:
      // Do something...
      break;
    case wrongParameterType:
      // Do something...
      break;
    case invalidToken:
      // Do something...
      break;
    default:
      throw (new Error('No have wrong code!'));
  }
};
```
5.any/void 任意值與虛空值

變數的型別如果不確定的話可以直接帶any，而函數的return type如果為空的話則可以直接帶:void

```typescript=
let notSure: any = 4;
notSure = "maybe a string instead"; //這樣不會報錯
notSure = false; //這樣也不會報錯
```

```typescript=
function warnUser(): void {
    console.log("This is my warning message");
}
```

6.undefined/null 未定義與空值

> TypeScript里，undefined和null两者各自有自己的类型分别叫做undefined和null。 和void相似，它们的本身的类型用处不是很大

```typscript=
// Not much else we can assign to these variables!
let u: undefined = undefined; 
let n: null = null;
```
> 在默認狀況下 undefined和null 這兩種value也可以被賦予給任何型別作為其值
```typescript=
let u: number = undefined; 
let n: syting = null;
```

- --strictNullChecks是什麼？
>簡單來說就是typescript 的tsconfig.json裡面的一個設定，只要做了這個設定以後，undefined和null 這兩種value就再也不會被默認為任何型別的一種預設值。也許在某處你想嘗試一個字串或空或未定義，可以使用聯合類型 ```ex: string|number|null```

```json
{
    "compileOnSave": false,
    "compilerOptions": {
        ...
        "strictNullChecks": true,
        "skipLibCheck": true,
        ...
    }
}
```

7. Never 這個型別是用來幹嘛用的?

never類型表示的是那些根本就不會有值的類型，例如一個只會return new Error('string') 的function； 
要注意值為never型別不接受null作為其值。

```typescript=
function error(message: string): never {
    throw new Error(message);
}
```

```typescript=
let something: void = null;
let nothing: never = null; // Error: Type 'null' is not assignable to type 'never'
```

8. 類型斷言

類型斷言好比其它語言裡的類型轉換，但是不進行特殊的數據檢查和解構。
.jsx檔案裡面只能用as的方式做類型斷言

```typescript
let someValue: any = "this is a string";

let strLength: number = (<string>someValue).length;
```

```typescript
let someValue: any = "this is a string";

let strLength: number = (someValue as string).length;
```