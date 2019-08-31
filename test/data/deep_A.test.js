
// const test = require('ava');

const deepObserver = require('../../src/data/deep_observer');
// test('deep-A', t => t.pass());

var data = {
  course: {
    title: 'algorithm',
    subcourse: {
      subtitle: 'dynamic'
    }
  }
}
deepObserver(
  data, 
  (key, value, newValue) => console.log('set', key, value, '->', newValue),
  (key, value) => console.log('get', key, value)
);
data.course;
data.course.title = 'data';

data.course.subcourse.subtitle = 'programming'