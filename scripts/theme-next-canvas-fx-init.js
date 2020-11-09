hexo.extend.filter.register('theme_inject', function (injects) {
  injects.bodyEnd.raw('load-custom-js', '<script src="assets/js/theme-next-default-canvas-fx.js"></script>', {}, { cache: true });
});
