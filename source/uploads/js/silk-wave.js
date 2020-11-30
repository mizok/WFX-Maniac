const SILK_WAVE_DEFAULT = {
  range: 100,
  strokeWeight: 2,
  strokeColor: 'white',
  lineNumber: 10,
  vertexGap: 20,
  frequency: 0.005,
}

class SilkWave extends CanvasFxBase {
  constructor(ele, config) {
    super(ele, config, SILK_WAVE_DEFAULT);
    this.init();
  }
  init() {
    super.init();
    requestAnimationFrame(() => {
      this.drawAll();
    })
  }
  drawAll() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let i = 0; i < this.range; i++) {
      let thisLineAlpha = super.linearInterpolation(i, 0, this.range, 0, 1); //定義單一線條顏色
      this.ctx.strokeStyle = `rgba(255,255,255,${thisLineAlpha})`;

      //把水平座標分割成複數段落
      for (let x = -(this.vertexGap / 2); x < this.space.width + (this.vertexGap / 2) + 1; x += this.vertexGap) {
        let randomNoise = this.perlinNoise(x * 0.001, i * 0.01, this.frameCount * this.frequency);
        let y = super.linearInterpolation(randomNoise, 0, 1, 0, this.space.height);
        if (x === -(this.vertexGap / 2)) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
        }
        else if (x < this.space.width + (this.vertexGap / 2) + 1) {
          this.ctx.lineTo(x, y, x, y + 100)
        }
      }
      this.ctx.stroke();
    }
    requestAnimationFrame(() => {
      this.drawAll();
    })
  }
}