let translateMenuItemZHTW = (str) => {
  str = str.replace(/(<li class=\"menu-item menu-item-archives\">\n\s*)(<a.*<i class="fa fa-archive fa-fw"><\/i>)(歸檔)(<span class="badge">12<\/span><\/a>)(\n\s\s\s<\/li>)/s, `$1$2時間線$4$5`);
  return str
}

let translateTitleZHTW = (str) => {
  str = str.replace(/(<title>歸檔\s\|\s)(.*)(<\/title>)/s, `<title>時間線 | $2$3`);
  return str;
}



hexo.extend.filter.register('after_render:html', (str, data) => {
  str = translateMenuItemZHTW(str);
  if (data.page.archive) {
    str = translateTitleZHTW(str);
  }
  return str;
})