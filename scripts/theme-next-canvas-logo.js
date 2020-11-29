let logoCanvas = `<canvas id="logo-canvas"></canvas>`
let canvasInit = `
<script>
  (()=>{
    let canvas = document.querySelector('#logo-canvas');

    let resize = ()=>{
      canvas.width = canvas.getBoundingClientRect().width;
      canvas.height = canvas.getBoundingClientRect().height;
    }
    let init= ()=>{
      let ripple = new RippleLogo(canvas,{
        points:2,
        randomFill:false,
        lineColor:'rgba(255,255,255,0.75)',
        maxSize:250
      });
      resize();
    }
   
    window.addEventListener('resize',resize);
    window.addEventListener('DOMContentLoaded',init);
  })()
</script>
`

let replaceLogoWithCanvas = (str) => {
  str = str.replace(/(<div class="site-meta">\n*.*class="brand"\srel="start">)(.*)(<i class="logo-line"><\/i>\n\s*<\/a>\n\s*<\/div>?)/s, `$1$2${logoCanvas}$3${canvasInit}`);
  return str;
}

hexo.extend.filter.register('after_render:html', (str, data) => {
  str = replaceLogoWithCanvas(str);
  return str;
})