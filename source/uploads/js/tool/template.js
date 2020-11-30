class template {
  constructor(
    ele, config
  ) {
    config = Object.assign(defaultConfig, config);
    this.ele = ele;
    Object.assign(this, config);
    this.init();
  }
  init() {
    if (this.ele.tagName !== 'CANVAS') {
      const space = document.createElement('canvas');
      this.ele.appendChild(space);
      this.space = this.ele.querySelectorAll('canvas')[0];
      this.canvasWidth = this.ele.getBoundingClientRect().width;
      this.canvasHeight = this.ele.getBoundingClientRect().height;
    }
    else {
      this.space = this.ele;
      this.canvasWidth = this.ele.parentElement.getBoundingClientRect().width;
      this.canvasHeight = this.ele.parentElement.getBoundingClientRect().height;
    }

    this.ctx = this.space.getContext('2d');
    this.size();
    const $this = this;
    window.addEventListener('resize', $this.debounce(() => {
      $this.size();
    }, 500));

  }
  size() {
    if (this.ele.tagName !== 'CANVAS') {
      this.canvasWidth = this.ele.getBoundingClientRect().width;
      this.canvasHeight = this.ele.getBoundingClientRect().height;
      this.space.width = this.canvasWidth;
      this.space.height = this.canvasHeight;
    }
    else {
      this.canvasWidth = this.ele.parentElement.getBoundingClientRect().width;
      this.canvasHeight = this.ele.parentElement.getBoundingClientRect().height;
      this.ele.width = this.canvasWidth;
      this.ele.height = this.canvasHeight;
    }

  }
  debounce(func, delay) {
    let timer = null;
    const $this = this;
    return () => {
      const context = $this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }

}