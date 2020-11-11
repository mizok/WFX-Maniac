hexo.extend.filter.register('theme_inject', function (injects) {
  injects.bodyEnd.raw('load-custom-js', '<script src="https://mizok.github.io/gonfalonJs/ripple.js"></script>', {}, { cache: true });
});
