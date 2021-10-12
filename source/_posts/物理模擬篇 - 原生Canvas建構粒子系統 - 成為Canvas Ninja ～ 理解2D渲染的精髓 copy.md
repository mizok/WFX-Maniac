---
title: Day 21 - 物理模擬篇 - 原生Canvas建構粒子系統 - 成為Canvas Ninja ～ 理解2D渲染的精髓
categories: 
- 前端技術學習心得
tags:
- 2021鐵人賽
---

在進入這個篇章之前，我可能需要先給各位*科普*一些基礎的CG動畫(Computer Graphic)常識～也就是我們這個`chapter` 的主角`粒子(Particles)`

# 什麼是粒子(Particles)

第一次聽到這個詞的人可能會把這東西想像成某種在漫畫電影中才會出現的`高科技`產品。

> MEGA粒子砲發射~~~        來自某暴露年齡系列

但是其實`粒子`在現實生活中指的就只是`體積極小的物體`而已，例如*灰塵*、*雜質*...,etc.  

但是到了`CG`的世界，`粒子`比起被賦予了一個新的`存在意義`，那就是用來作為『構成特效的最小單位』。

『構成特效的最小單位』這句話聽起來很不好理解，所以我這邊給大家準備了*幾張圖*。

![img](https://i.imgur.com/jfHovZK.jpg)

> 大家應該都知道這圖哪來的 :P

上圖就是一個典型的`遊戲特效`範例，當然`特效`會有很多種，就像圖片中人物角色放招式噴出來的`光波`，或是物體與潮濕環境碰撞時噴濺的`水花`，甚至是遊戲場景中燃燒的`火焰`...等。

這些`特效`其實有很大一部分都是由眾多細小`粒子`所構成（如下圖）。

![img](https://i.imgur.com/mTiY6Yh.png)

![img](https://i.imgur.com/5McglAy.png)

粒子特效的原理就是藉由調整`粒子群`的`瞬時密度`，還有它們本身的`顏色`、`大小`、`填充圖樣`、`物理運動方式`
來達成想要的`視覺效果`。

> 咦？你說那我要怎麼樣用程式寫出像最上面那張圖的特效? 

『如何從微小粒子組成指定特效』這部分其實很吃`想像力`和`技術力`，所以大多數的遊戲公司其實會有一種職位叫做`技術美術(TA)`(可以想像成有美術能力的工程師)，他們就是專門在處理這類問題的一夥人。

我們在這個`chapter`要講解的就是怎麼樣在`web端`建構起一個簡單的`粒子特效系統`，但是我們不會把這部分帶得太深，主要是介紹基本的實作方法。

下面就讓我們開始吧~

# 粒子特效系統的構成

![img](https://i.imgur.com/SRIquVg.png)

這張圖很簡單明瞭的說明了一個基本`粒子特效系統`的構成～

- 環境(Environment)：指的就是環境中可能影響`粒子`的各種條件，例如`氣流`、`重力`、`摩擦力`...等。
- 粒子群(Particles): 就是粒子的集合。
- 發射器(Emitter): 想要噴出粒子當然就要有一個`發射器`，他會以特定的`模式`無間斷地釋放出`粒子`到空間中。

看到這邊不曉得大家是不是已經有點概念要怎麼寫了呢?  

這邊的`環境`其實在我們前面的幾個案例都有實作過(重力、摩擦力)，而所謂的`粒子群`則可以想像成一堆的`小球`。 

比較難想像的可能是`發射器`這個概念。

`發射器`會有幾個基本的屬性:

- 可以設定`發射口徑大小`
- 可以設定`當前存在位置的座標`
- 可以設定`散射角`，也就是噴灑出粒子的`可容許角度範圍`

`發射口徑大小`可以訂出一個指定的面積範圍，然後用Math.random()之類的隨機函數去決定每顆`粒子`要個別從這個面積上的哪一個座標射出。

`當前存在位置的座標`就是單純的設置X/Y值。

`散射角`的話就是事先決定一個最大的`散射範圍`,然後用Math.random()去決定每顆`粒子`噴射的角度。

這邊我們就開始看程式吧～

# 程式實作

````javascript

import { Canvas2DFxBase } from '../base';
import { randomWithinRange, degreeToRadian } from '../function';
import { drawSquare, drawCircle } from '../shape';
import { linearInterpolation, colorInterpolation } from '../interpolation';
import { FIRE } from './fire';
import { ILLUSION } from './illusion';
import { TRAIL } from './trail';
import { STARDUST } from './stardust';

const DEFAULT = {
  bgColor: 'black',
  space: {
    gravity: {
      x: 0,
      y: 0
    },
    wind: {
      x: 0,
      y: 0
    }
  },
  projector: {
    motionTrail: (x) => null,//  not valid if mouseControl is enabled.
    enableMouseAndGuestureControl: false,
    dispersionRange: 20,
    directionAngle: 90,
    width: 1,
    height: 1,
  },
  particles: {
    density: 10,
    type: "circle",
    width: {
      base: 10,
      floatingThreshold: 0
    },
    lifespan: {
      base: 300,
      floatingThreshold: 0
    },
    color: {
      from: "rgba(255, 255, 255,1)",
      to: "rgba(255, 255, 255,1)"
    },
    opacity: 1,
    speed: {
      base: 100,
      floatingThreshold: {
        x: 0,
        y: 0
      }
    },
  },
}



class ParticleSys extends Canvas2DFxBase {
  constructor(ele, config, defaultConfig) {
    super(ele, config, defaultConfig);
    this.pool = [];
    this.init();
  }
  init() {
    this.initProjector();
    if (this.config.projector.enableMouseAndGuestureControl) {
      this.addMouseAndGuestureControl();
    }
    this.drawAll();
  }

  initProjector() {
    this.projector = {
      width: this.config.projector.width,
      height: this.config.projector.height,
      position: {
        x: this.cvs.width / 2,
        y: this.cvs.height / 2
      }
    }
  }

  genParticle(type, width, color, speedX, speedY, positionX, positionY, lifespan, opacity) {
    let $this = this;
    let particle = {
      type: type,
      draw: $this.getParticleDrawingType(type),
      maxWidth: width,
      width: width,
      color: color,
      lifespan: lifespan,
      life: lifespan,
      opacity: opacity,
      speed: {
        x: speedX,
        y: speedY,
      },
      position: {
        x: positionX,
        y: positionY
      },
      dead: false
    }
    return particle;
  }

  addMouseAndGuestureControl() {
    this.projector.position = {
      x: this.mouse.x,
      y: this.mouse.y,
    }

    requestAnimationFrame(this.addMouseAndGuestureControl.bind(this))
  }


  getParticleLaunchDirection() {
    return randomWithinRange(
      degreeToRadian(-this.config.projector.directionAngle - 180 - this.config.projector.dispersionRange / 2),
      degreeToRadian(-this.config.projector.directionAngle - 180 + this.config.projector.dispersionRange / 2),
    )
  }

  fillPool() {
    let particles = this.config.particles;
    let projector = this.projector;
    let type = particles.type;
    let color = particles.color.from;
    let opacity = particles.opacity;
    let positionX = projector.position.x + randomWithinRange(-projector.width / 2, projector.width / 2);
    let positionY = projector.position.y + randomWithinRange(-projector.height / 2, projector.height / 2);
    for (let i = 0; i < this.config.particles.density / 10; i++) {
      let width = particles.width.base + randomWithinRange(-particles.width.floatingThreshold, particles.width.floatingThreshold);
      let lifespan = particles.lifespan.base + randomWithinRange(-particles.lifespan.floatingThreshold, particles.lifespan.floatingThreshold);
      let speedX = particles.speed.base * Math.sin(this.getParticleLaunchDirection()) + randomWithinRange(-particles.speed.floatingThreshold.x, particles.speed.floatingThreshold.x) + this.config.space.gravity.x + this.config.space.wind.x;
      let speedY = particles.speed.base * Math.cos(this.getParticleLaunchDirection()) + randomWithinRange(-particles.speed.floatingThreshold.y, particles.speed.floatingThreshold.y) + this.config.space.gravity.y + this.config.space.wind.y;
      let particle = this.genParticle(type, width, color, speedX, speedY, positionX, positionY, lifespan, opacity);
      this.pool.push(particle);
    }
  }

  refreshParticlesPosition() {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].position.x += this.pool[i].speed.x * this.timeElapsed;
      this.pool[i].position.y += this.pool[i].speed.y * this.timeElapsed;
    }
  }

  getParticleDrawingType(type) {
    switch (type) {
      case 'square':
        return drawSquare
      case 'circle':
        return drawCircle
    }
  }


  drawAll() {
    this.background(this.config.bgColor);
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].dead) {
        this.pool[i].draw(this.ctx, this.pool[i].position.x, this.pool[i].position.y, this.pool[i].width, this.pool[i].color, this.pool[i].opacity);
        this.pool[i].life -= 1;
        if (this.pool[i].life > 0) {
          this.pool[i].width = linearInterpolation(this.pool[i].life, this.pool[i].lifespan, 0, this.pool[i].maxWidth, 0);
          this.pool[i].opacity = linearInterpolation(this.pool[i].life, this.pool[i].lifespan, 0, this.config.particles.opacity, 0);
          this.pool[i].color = colorInterpolation(this.pool[i].life, this.pool[i].lifespan, 0, this.config.particles.color.from, this.config.particles.color.to);
        }
        else {
          this.pool[i].dead = true;
        }
      }
      else {
        this.pool.splice(i, 1);
        i--;
      }
    }

    this.refreshParticlesPosition();

    this.fillPool();

    requestAnimationFrame(this.drawAll.bind(this))
  }

}

(() => {
  let cvs = document.querySelector('canvas');
  let instance = new ParticleSys(cvs, STARDUST, DEFAULT);
})()
````


Github repo: https://github.com/mizok/ithelp2021/blob/master/src/js/particle-sys/index.js


Github Page: https://mizok.github.io/ithelp2021/particle-sys.html












