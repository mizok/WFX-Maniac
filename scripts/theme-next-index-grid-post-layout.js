let spawnBanner = (str) => {
  str = str.replace(/(<main class="main">\n\s*)(<header class="header)/s, `<div class="site-banner" id="site-banner"><canvas id="site-banner-canvas" class="site-banner-canvas"></canvas></div>$1$2`);
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




