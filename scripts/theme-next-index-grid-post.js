let removeRedundantString = (str) => {
  str = str.replace(/(<div class="powered-by">).*(<\/div>)/s, ``);
  str = str.replace(/(<span class="with-love">).*(<span class="author")/s, `$2`);
  return str
}

let changeMainInnerClass = (str) => {
  str = str.replace(/(<div class="main-inner index posts-expand">)/s, `<div class="main-inner index posts-montage">`);
  return str
}


let changePostBlockToAnchorBlock = (str) => {

}


hexo.extend.filter.register('after_render:html', (str, data) => {
  if (data.page.__index) {
    str = removeRedundantString(str);
    str = changeMainInnerClass(str);
  }


  return str;
})




