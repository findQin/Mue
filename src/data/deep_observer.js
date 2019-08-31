
/**
 * 深度属性监听
 * @param {Object} data 
 * @param {Function} onSet 
 * @param {Function} onGet 
 */
function deepObserver(data, onSet, onGet, prefix) {
  if (typeof data !== 'object') {
    return;
  }
  const keys = Object.keys(data);
  keys.forEach(key => {
    let value = data[key];
    let fullKey = prefix ? `${prefix}.${key}` : key;
    deepObserver(value, onSet, onGet, fullKey);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      set: function(newValue) {
        onSet && onSet(fullKey, value, newValue);
        value = newValue;
      },
      get: function() {
        onGet && onGet(fullKey, value);
        return value;
      }
    });
  });
}

module.exports = deepObserver;