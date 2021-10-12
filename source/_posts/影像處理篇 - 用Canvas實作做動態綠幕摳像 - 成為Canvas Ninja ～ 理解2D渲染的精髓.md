---
title: Day 24 - 影像處理篇 - 用Canvas實作做動態綠幕摳像 - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

上一篇我們提到我們接著要開始玩一些比較有趣的實作~

所以我就決定要來講講怎麼在`web`端實作`綠幕摳像(Green Screen Keying)`~


# 什麼是綠幕摳像？

![img](https://i.imgur.com/nRGD2OK.jpg)

大家應該都有看過很多電影特效幕後花絮的照片，照片裡面的特效演員會在一個綠色帆布架構成的場景前面拍戲，這種綠色帆布場景就是動畫業界常常在說的`綠幕`。

而`綠幕摳像(Green Screen Keying)`指的就是把`綠幕`影片中的`人物`單獨擷取出來的技術。

> 有些人可能會好奇為什麼要用綠色，據說是因為綠色是成效最好的一種顏色，大部分的戲劇拍攝道具/ 人類皮膚...,etc. 上綠色佔比平均來講比較少

其實這個技術在很多的`影像後製軟體`裡面都有對應的功能(例如After Effects的 Color Key)，讓使用者可以從拍攝好的綠幕影片中取得後製合成所需要的素材。

# 用Canvas實作做動態綠幕摳像

大家不知道還對我們之前使用過的`ctx.drawImage` 這個api有沒有印象～  

這個api可以讓使用者去把指定的img source繪製到canvas上面，而除了image source以外，  

他繪製的對象也可以是另外一張canvas(把某張canvas的內容畫到現在這張canvas上面), 甚至是可以把影片(video)某一瞬間的靜態畫面畫出來。

> 延伸閱讀 - MDN 上的ctx.drawImage: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

這個案例其實蠻簡單的，主要的流程大致上就是

- 首先創建一個`video` tag用來承接video source
- 用ctx.drawImage 去By frame 把`video` 元素的畫面繪製到另外一個`canvas`上
- 從繪製好video畫面的`canvas`上面提取imageData
- 把imageData做摳像處理
- 把做好摳像處理的imageData再畫到另外一張`canvas`上面

接下來就是實作的部分~

而在開始實作之前我們必須要先有一個`綠幕`的影像拿來當做`素材`，這邊可以去[pixabay.com](https://pixabay.com/)，這上面有提供很多免費的`綠幕`素材。


````javascript
const videoSource = require('../../video/t-rex.mp4');
import { Canvas2DFxBase } from '../base';


class GreenScreenKeying extends Canvas2DFxBase {
  constructor(cvs,rmax = 100,gmin = 150,bmax = 100) {
    super(cvs);
    this.gmin = gmin;
    this.rmax = rmax;
    this.bmax = bmax;
    this.init();
  }

  init() {
    this.initScreens(videoSource, 500);
  }


  initScreens(videoSrc, size) {
    // 這邊我們創建一個video tag用來承接透過require() import 進來的 source
    this.video = document.createElement('video');

    // 這邊我們透過promise 來確保後續的程式都會在video 載入完畢之後執行, 這部分這樣寫的原因主要是因為要把canvas的大小設置成和影片一樣，但是video 的長寬尺寸必須要在載入完畢之後才能正確取得(否則可能會取得0)
    let resolve;
    const promise = new Promise((res) => { resolve = res });

    
    this.video.addEventListener('loadeddata', () => {
      // Video is loaded and can be played
      resolve();
    }, false);

    // video 被按下的時候發動 video的play方法，然後開始canvas的渲染
    this.video.addEventListener('click', () => {
      this.video.play();
      this.animate();
    }, false);

    promise.then(() => {
      // videoWidth/videoHeight分別是video 的原始高/原始寬
      const vw = this.video.videoWidth;
      const vh = this.video.videoHeight;
      // 這邊就是開始把canvas和video的大小都設定為一樣
      this.videoStyleWidth = size;
      this.videoStyleHeight = (vh / vw) * size;
      this.video.style.width = this.videoStyleWidth + 'px';
      this.video.style.height = this.videoStyleHeight + 'px';

      // 創建一個架空的canvas, 把他的長寬設定成跟video現在一樣
      this.virtualCanvas = document.createElement('canvas');
      this.virtualCanvas.width = this.videoStyleWidth;
      this.virtualCanvas.height = this.videoStyleHeight;
      // 取得架空canvas的2Dcontext，並把它設置為本class的一項property
      this.virtualCtx = this.virtualCanvas.getContext('2d');
      this.setCanvasSize(this.videoStyleWidth, this.videoStyleHeight);
      document.body.prepend(this.video);
    })

    this.video.src = videoSrc;
  }

  animate() {
    // 若影片停止或被暫停, 則停止canvas動畫的渲染
    if (this.video.paused || this.video.ended) return;
    const $this = this;
    // 把當前video 的樣子繪製在架空的canvas上
    this.virtualCtx.drawImage(this.video, 0, 0, this.videoStyleWidth, this.videoStyleHeight);
    // 取得架空canvas的imageData
    const virtualImageData = this.virtualCtx.getImageData(0, 0, this.videoStyleWidth, this.videoStyleWidth);
    // 把取得的imageData做綠幕摳像處理
    const keyedImageData = this.getKeyedImageData(virtualImageData);
    // 回填imageData
    this.ctx.putImageData(keyedImageData, 0, 0);
    requestAnimationFrame(this.animate.bind($this))
  }

  getKeyedImageData(imageData) {
    const data = imageData.data;
    const keyedImageData = this.ctx.createImageData(imageData.width, imageData.height);
    for (let i = 0; i < data.length; i = i + 4) {
      // 這邊的運算其實也很簡單，原理就是若偵測到g channel的值超過150 ,且 r和b都低於100(也就是顏色很可能偏綠)，那就把該組像素的alpha channel值設置為0, 讓他變透明 
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      keyedImageData.data[i] = r;
      keyedImageData.data[i + 1] = g;
      keyedImageData.data[i + 2] = b;
      if (g > this.gmin && r < this.rmax && b < this.bmax) {
        keyedImageData.data[i + 3] = 0;
      }
      else {
        keyedImageData.data[i + 3] = data[i + 3];
      }
    }
    return keyedImageData;
  }


}


(() => {
  const cvs = document.querySelector('canvas');
  const instance = new GreenScreenKeying(cvs);
})();
````

