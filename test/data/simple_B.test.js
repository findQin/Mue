import test from 'ava';
const simpleObserver = require('../../src/data/simple_observer')

test('simple-deep', t => t.pass());

// For Test 2
var data = {
  course: {
    title: 'algorithm'
  }
}
simpleObserver(
  data, 
  (key, value, newValue) => console.log('set', key, value, '->', newValue),
  (key, value) => console.log('get', key, value)
)
data.course;
data.course.title = 'data'

/**
 * 问题
 * - 1. 对象结构内容无法监听
 * - 2. 复杂路径修改时key值问题
 */