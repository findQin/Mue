


function mueObserver(data, onSet, onGet, prefix) {
  // 非Object对象已经实现监听
  if (typeof data !== 'object') {
    return;
  }
  // 重载Array方法实现数组的监听
  if (Array.isArray(data)) {
    data.push = function(...items) {
      let len = data.length;
      items.forEach((item, index) => {
        Array.prototype.push.call(data, item);
        onSet && onSet(`${prefix}.${len + index}`, undefined, item);
        observerKeys(data, len + index, onSet, onGet, prefix);
      })
    }
    data.pop = function() {
      let idx = data.length - 1;
      let val = data[idx];
      Array.prototype.pop.call(data);
      onSet && onSet(`${prefix}.${idx}`, val, undefined);
    }
  }
  // 普通对象监听
  const keys = Object.keys(data);
  observerKeys(data, keys, onSet, onGet, prefix);
  return data;
}

function observerKeys(data, keys, onSet, onGet, prefix) {
  [].concat(keys).forEach(key => {
    let value = data[key];
    let fullKey = prefix ? `${prefix}.${key}` : key;
    mueObserver(value, onSet, onGet, fullKey);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      set: function(newValue) {
        value = newValue;
        onSet && onSet(fullKey, value, newValue);
      },
      get: function() {
        onGet && onGet(fullKey, value);
        return value;
      }
    });
  });
}

try {
  if (typeof module !== undefined) {
    module.exports = mueObserver;
  }
} catch(e) {

}
