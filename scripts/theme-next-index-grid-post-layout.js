let changeMainInnerClass = (str) => {
  str = str.replace(/(<div class="main-inner index posts-expand">)/s, `<div class="main-inner index posts-montage">`);
  return str
}


hexo.extend.filter.register('after_render:html', (str, data) => {
  if (data.page.__index && data.config.theme_config.index_post_grid_layout) {
    str = changeMainInnerClass(str);
  }

  return str;
})




