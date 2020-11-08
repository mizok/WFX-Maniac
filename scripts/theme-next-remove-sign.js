let removeRedundantString = (str) => {
  str = str.replace(/(<div class="powered-by">).*(<\/div>)/s, ``);
  str = str.replace(/(<span class="with-love">).*(<span class="author")/s, `$2`);
  return str
}



hexo.extend.filter.register('after_render:html', (str, data) => {
  if (data.config.theme_config.no_hexo_credit) {
    str = removeRedundantString(str);
  }
  return str;
})




