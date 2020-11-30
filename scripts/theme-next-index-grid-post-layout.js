let canvas = `<canvas id="site-banner-canvas"></canvas>`
let canvasInit = `
<script>
  (()=>{
    let canvas = document.querySelector('#site-banner-canvas');

    let init= ()=>{
      
    }
   
    window.addEventListener('DOMContentLoaded',init);
  })()
</script>
`

let spawnBanner = (str) => {
  str = str.replace(/(<main class="main">\n\s*)(<header class="header)/s, `
    <div class="site-banner" id="site-banner">
      ${canvas}
      ${canvasInit}
    </div>
    $1$2
  `);
  return str;
}

let changeMainInnerClass = (str) => {
  str = str.replace(/(<div class="main-inner index posts-expand">)/s, `<div class="main-inner index posts-montage">`);
  return str
}


hexo.extend.filter.register('after_render:html', (str, data) => {
  if (data.page.__index && data.config.theme_config.index_post_grid_layout) {
    str = changeMainInnerClass(str);
    if (data.config.theme_config.hasBanner) {
      str = spawnBanner(str);
    }
  }

  return str;
})




