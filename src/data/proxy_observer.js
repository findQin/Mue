/**
 * Proxy属性监听
 * @param {Object} data 
 * @param {Function} onSet 
 * @param {Function} onGet 
 */
function proxyObserver(data, onSet, onGet, prefix) {
  if (typeof data !== 'object') {
    return;
  }
  const keys = Object.keys(data);
  keys.forEach(key => {
    let value = data[key];
    let fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object') {
      data[key] = proxyObserver(value, onSet, onGet, fullKey);
    }
  });
  return new Proxy(data, {
    set(target, property, value, receiver) {
      onSet && onSet(property, value);
      return Reflect.set(target, property, value, receiver);
    },
    get(target, property, receiver) {
      let getValue = Reflect.get(target, property, receiver);
      if (Reflect.has(target, property)) {
        onGet && onGet(prefix ? `${prefix}.${property}` : property, getValue);
      }
      return getValue;
    },
  })
}

// 课程Example
const observe = data => {
  if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
      return
  }

  Object.keys(data).forEach(key => {
    let currentValue = data[key]
    // 事实上 proxy 也可以对函数类型进行代理。这里只对承载数据类型的 object 进行处理，读者了解即可。
    if (typeof currentValue === 'object') {
      observe(currentValue)
      data[key] = new Proxy(currentValue, {
        set(target, property, value, receiver) {
          // 因为数组的 push 会引起 length 属性的变化，所以 push 之后会触发两次 set 操作，我们只需要保留一次即可，property 为 length 时，忽略
          if (property !== 'length') {
            console.log(`setting ${key} value now, setting value is`, currentValue)
          }
          return Reflect.set(target, property, value, receiver)
        },
        get(target, property, receiver) {
          console.log(`getting ${key} value now`);
          return Reflect.get(target, property, receiver);
        }
      })
    }
    else {
      Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get() {
          console.log(`getting ${key} value now, getting value is:`, currentValue)
          return currentValue
        },
        set(newValue) {
          currentValue = newValue
          console.log(`setting ${key} value now, setting value is`, currentValue)
        }
      })
    }
  }) 
}

module.exports = proxyObserver;