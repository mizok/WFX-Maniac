
hexo.extend.filter.register('after_render:html', (str, data) => {
  if (data.page.__index) {

  }
  return str;
})
