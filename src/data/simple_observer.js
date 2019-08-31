
/**
 * 简单属性监听
 * @param {Object} data 
 * @param {Function} onSet 
 * @param {Function} onGet 
 */
function simpleObserver(data, onSet, onGet) {
  const keys = Object.keys(data);
  keys.forEach(key => {
    let value = data[key];
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      set: function(newValue) {
        onSet && onSet(key, value, newValue);
        value = newValue;
      },
      get: function() {
        onGet && onGet(key, value);
        return value;
      }
    });
  });
}

module.exports = simpleObserver;