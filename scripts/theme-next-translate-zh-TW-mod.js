let translateMenuItemZHTW = (str) => {
  str = str.replace(/(<li class=\"menu-item menu-item-archives\">\n\s*)(<a.*<i class="fa fa-archive fa-fw"><\/i>)(歸檔)/s, `$1$2時間線`);
  return str
}

let translateTitleZHTW = (str) => {
  str = str.replace(/(<title>歸檔\s\|\s)(.*)(<\/title>)/s, `<title>時間線 | $2$3`);
  return str;
}



hexo.extend.filter.register('after_render:html', (str, data) => {
  if (data.page.archive) {
    str = translateTitleZHTW(str);
  }
  str = translateMenuItemZHTW(str);

  return str;
})