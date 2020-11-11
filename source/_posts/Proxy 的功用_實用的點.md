---
title: Proxy 的功用/實用的點
---


## 1. 實作雙/單向 prop trap綁定  

````javascript
const input = document.querySelector('#username')
const handler = {
    set: function(target, key, value) {
        if (target.id && key === 'username') {
            target[key] = value;
            document.querySelector(`#${target.id}`)
            .value = value;
            return true
        }
        return false
    }
}

const proxy = new Proxy(inputState, handler)
proxy.value = 'John Doe'
````



## 2. trap呼叫無效/ 不存在方法的行為並throw error
````javascript
function Foo() {
  return new Proxy(this, {
    get: function (object, property) {
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
      } else {
        return function methodMissing() {
          console.log('you called ' + property + ' but it doesn\'t exist!');
        }
      }
    }
  });
}

Foo.prototype.bar = function () {
  console.log('you called bar. Good job!');
}

foo = new Foo();
foo.bar();
//=> you called bar. Good job!
foo.this_method_does_not_exist()
//=> you called this_method_does_not_exist but it doesn't exist
````