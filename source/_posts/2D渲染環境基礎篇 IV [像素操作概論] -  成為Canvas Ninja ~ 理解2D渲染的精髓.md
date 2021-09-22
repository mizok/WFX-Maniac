---
title: Day8 - 2D渲染環境基礎篇 IV[像素操作概論] -  成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

『像素操作(Pixel Manipulation)』 顧名思義就是要去以單一像素為最小單位來進行操作，就像我們透過JS改變DOM結構所進行的『DOM操作』必須要先取得被操作元素一樣。  

# canvas 像素操作起手式

上面我們提到了要做像素操作，就必須先取得像素。

就像DOM操作一樣，在操作DOM的時候我們通常要先抓取(`query`)到目標元素，然後才可以接著做`append`/`prepend`/`setAttribute`之類的事情。  

而像素操作的第一步就是要先取得canvas的像素數據(Image Data)。

````javascript
let imageData = ctx.getImageData(sx, sy, sw, sh);
// sx: 想要取得的圖像區域的左上角x軸座標值
// sy: 想要取得的圖像區域的左上角y軸座標值
// sw: 想要取得的圖像區域的寬度
// sh: 想要取得的圖像區域的高度
````

# 何謂像素數據(Image Data)

我們在前面有提到過，canvas可以被視為一群像素的集合體，而每一個像素本身是由4個channel值所組成的。  

> 『一張寬度100px, 高度100px的canvas，它實際上就是100\*100 = 10000個像素的集合體，而同時在程序上我們則可以把它轉換成一個長度為100\*100\*4的陣列(也就是一共40000個channel值)。』  --- 來自我們前面提過的內容

當我們用ctx.getImageData去取得完整一張canvas(sx,sy定為0, sw, sh定為canvas寬高)的imageData時，我們實際上會取得一個含有全部像素channel值的Uint8ClampedArray（8位元無符號整型固定陣列）

這邊我們透過console.log去檢驗一組由100px x 100px 大小canvas所提取的imageData

![img](https://i.imgur.com/8bzGT1G.png)
> codepen連結: https://codepen.io/mizok_contest/pen/powKopj

簡單觀察一下首先可以發現, Uint8ClampedArray其實只是imageData的一部分(imageData.data)，其餘還會有height/width等屬性，imageData本身具備獨立的型別，就像String/Array 那樣，他不只單純是個物件而已。

> 有關於ImageData這個型別相關的資訊可以看[這邊](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

然後接著看看Uint8ClampedArray的部分，可以發現他確實就是由全部像素的channel值所組成;由於我們填入的顏色是紅色(255,0,0,1)，所以channel值的分佈會是255,0,0,255這樣四個一組持續到結束的組合.....，這邊值得注意的一點是Uint8ClampedArray是以0到255來表示alpha channel的值，而不是0到1，那是因為8位元的關係(2的8次方是256, 而0~255剛好是256個數字)。  

> 人類的眼睛大約只可分辨 1,000 萬種顏色，之所以channel值是用8位元陣列來表示，是因為256的3次方(rgb三原色)為16,777,216 , 這個數字恰好落在1000萬的level。

理解了ImageData的資料格式之後，接著可能就會有人問:  

> 我們有沒有辦法從零自己建立一組新的ImageData?

Sure, 當然是可以的，而且方法還不只一種。

一般要自己create 新的ImageData，可以依靠:  
- 2D渲染環境底下的createImageData方法（ctx.createImageData）
- ImageData class的 constructor (支援性低)

這兩種方法的最大差別就在於前者需要編譯環境下有2DContext存在，但是後者就是可以直接New一個物件出來(適用在部分非瀏覽器環境，另外IE不支援這方法)。  

自己建立出來一個ImageData物件之後，接著可能就會有人再問：

> 那要怎麼把建立出來的ImageData 放到Canvas渲染出來？

這時候就該ctx.putImageData登場了～

````javascript
void ctx.putImageData(imageData, dx, dy);
void ctx.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
// dx: 置放該ImageData渲染區的座標X值(置放在目標canvas上的位置)
// dy: 置放該ImageData渲染區的座標Y值(置放在目標canvas上的位置)
// dirtyX: 可以只渲染該ImageData的一部分, 這個值就是用來定義渲染區的起始座標X值(這個值是相對於該ImageData的0,0圓點而言)
// dirtyY: 可以只渲染該ImageData的一部分, 這個值就是用來定義渲染區的起始座標Y值(這個值是相對於該ImageData的0,0圓點而言)
// dirtyWidth: 可以只渲染該ImageData的一部分, 這個值就是用來定義渲染區的寬度
// dirtyHeight: 可以只渲染該ImageData的一部分, 這個值就是用來定義渲染區的高度
````

介紹完基本的ImageData API，我們接著來看一個蠻經典的像素操作案例～

# 經典的像素操作案例解析 - 拼字圖畫(Image To Ascii)

所謂的拼字圖畫就是像下圖這種，把圖像變成不同符號所形成的一幅圖

![img](https://i.imgur.com/nhxwsL9.jpg)

這邊我分成幾個主要步驟稍微描述一下拼字圖畫的程序邏輯

- 用ctx.drawImage() 先把指定的圖片繪製到canvas上

- 從繪製好圖像的canvas上取得imageData

- 透過把imageData的每個像素點channel值總合取平均來將圖像轉為灰階

- 根據灰階圖像的imageData來把不同的灰階值(例如0~50以@代替,51~100以#代替)轉換為特定符號，然後把這些符號作為字串植入pre元素

接著是源碼：

````javascript
// 取得圖像載入promise
function loadImage(src){
    let img = new Image();
    // 把resolve暴露給外部變數
    let resolve;
    let loadPromise = new Promise((res)=>{
         resolve = res;
    })
    // 這一步cross-origin是因為我們的圖片是外部來源
    // 如果沒有把外部來源設置為"Anonymous",drawImage方法會排除掉非本地來源的圖片資訊, 導致無法進行下一步繪圖
    img.crossOrigin = "Anonymous";
    img.onload = ()=>{
       resolve(img);
    }
    img.src = src;
  
    return loadPromise;
}

async function getImageDataFromImage(src,ratio = 0.5){
  // 這邊有一個ratio參數是因為我讀取的圖片稍微有點大張
  // 所以我補一個參數讓我可以自己決定要把圖片縮小多少倍率
  let img = await loadImage(src);
  let width = img.width * ratio;
  let height = img.height * ratio;
  // 把外部圖源繪製到架空的canvas上面然後取得imageData
  let cvs = document.createElement('canvas');
  let ctx = cvs.getContext('2d');
      cvs.width = width;
      cvs.height = height;
      ctx.drawImage(img,0,0,width,height);
  let imageData = ctx.getImageData(0,0,width,height);
  
  return imageData;
}

async function turnImageDataIntoGrayscale(src){
   let imageData = await getImageDataFromImage(src);
   let data = imageData.data;
  // 這邊這個loop的用意就在於把channel值依像素順序來執行程序
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

async function redrawAsASCII(src){
  let grayscaleImageData = await turnImageDataIntoGrayscale(src);
  // 取用的樣版字元
  let glyphSource = "＄＠＃＊。";
  let stringOutput = '';
  for(let i = 0;i<grayscaleImageData.data.length;i = i+4){
     
     let pixelIndex = Math.ceil(i/4);
     // 從像素的次序來判斷該像素是否為右邊緣像素
     let pixelIsRightRimPixel = (pixelIndex + 1) % grayscaleImageData.width === 0;
     // 根據像素的灰階值, 用內插的方式來決定要使用哪一個樣版字元來代表該像素
     let glyphIndex = 
       Math.floor(grayscaleImageData.data[i] / 255 * (glyphSource.length-1));
       
       stringOutput+=glyphSource[glyphIndex];
    
     if(pixelIsRightRimPixel){
       // 如果是最右邊緣像素, 則另外補一個換行符號
        stringOutput+='\n';
     }
  }
  // 把字串填入pre tag
  let text = document.querySelector('pre');
  text.innerHTML = stringOutput;
}




(()=>{
  redrawAsASCII('https://i.imgur.com/52TLlOk.png');
})()
````

codepen連結：https://codepen.io/mizok_contest/pen/vYZrXYP

# 小結

老實說我在挑選展示像素操作案例的時候猶豫了很久，最後還是決定要拿拼字圖畫來作為案例介紹。  
主要是因為我覺得這個案例相較於其他的例子似乎更能讓人提起興趣(雖然對初學者來說可能有點小複雜)。  

在上面這個案例中，其實可以學到很多的小技巧，包括：

- canvas載入圖片的機制
- imageData的邊緣像素處理
- 將channel值依像素順序來執行迴圈程序
- ...

這些小技巧在這個系列文的中後段都會持續用到，所以建議可以仔細讀一下源碼裡面的註解～

這邊我們介紹的『拼字圖畫』其實還只是很基本的一種像素操作運用案例，像素操作真正被廣泛運用(同時也更複雜)的地方實際上在於影像處理(Image Processing)領域，我們將會在稍後的篇章再繼續提到這部分，敬請期待~。
