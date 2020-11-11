---
title: TYPESCRIPT學習筆記-ep3
categories: 
- 心得
tags:
- ts
---



## TS 的class 跟 es6 有什麼差別？

#### 1. private與 public 宣告的存在:
如果一個方法/變數/constructor被宣告為public 則能在聲明它的類的外部被取用
反之若宣告為private， 那這個方法/變數/constructor 就只能在自己的class裡面被使用

所以說這樣會錯

> 實際上, 當private 方法/變數/constructor 在父類別被繼承出去的時候，
他是會進到子類別（或子類別的實例）裡面的，但是就是無法訪問而已

````typescript
class fruit{
    constructor(){

    }

    private type ="fruit";
    method1(){
        console.log(this.type);
    }
}


let a  = new fruit();
console.log(a.type);//報錯, 因為type 只能在fruit裡面被使用，被new 出來的實例沒辦法取得他


class apple extends fruit{
    constructor(){
        super();
        this.type = "aa"
    }
    mm(){
        console.log(this.type);//報錯, 因為type 只能在fruit裡面被使用，就算是extend 過來也不行
    }
}
````


#### 2. protect 宣告的存在:

##### 如果一個class 的方法/變數/constructor被宣告為protected， 則:
1. 這個方法/變數/constructor能在class裡面被叫用
但是我們不能透過這個class的實例去拿到他被 protect 的東西
2. 但若如果今天這個class被作為一個父類別被繼承下去的話，他的子類別在子類class的實例化前/後, 
都可以去訪問這個被protected的東西


#### 3. readonly 宣告的存在:

##### 如果一個class 的變數被宣告為readonly， 則:
1. 這個方法/變數/constructor只能在class(實例化前後)被讀取，但不能被改變
2. 就算class被作為父類別繼承，他的子類別一樣不能去修改父類別繼承下來的變數
3. 注意 readonly只能用來把變數標注成唯讀，方法跟constructor 是不能設定的

#### 4. getter與 setter

> typescript 的 class 可以把裡面的變數(屬性) 寫成 getter與setter 的形式[color=#36c169]

> 如果是用VSCODE作為IDE的話，可以先把變數(屬性)反白，然後右鍵點左上角的小燈泡，這樣就可以自動產出ts 的get/set snippet 語法
> ![](https://i.imgur.com/qGgO47X.png)

以上面圖片這個例子來講, 當這個class的a屬性被改成get/set之後，就會變成下面這樣

````typescript
class test{
  constructor(){

  }
  private _a: string = "abc";
  public get a(): string {
    return this._a;
  }
  public set a(value: string) {
    this._a = value;
  }
}
````

然後當這個class被實例化之後就可以透過setter去賦值，也就是
````typescript
let example  = new test();
test.a = "def";
//  這邊"def"會自動作為value 被帶入到set a(value)裡面去
````


