
const proxyObserver = require('../../src/data/proxy_observer');

var data = {
  title: 'A',
  course: {
    title: 'algorithm',
    subcourse: {
      subtitle: 'dynamic'
    }
  }
}
debugger;
data = proxyObserver(
  data, 
  (key, value, newValue) => console.log('set', key, value, '->', newValue),
  (key, value) => console.log('get', key, value)
);

// data.title
// data.course;
// data.course.title
debugger;
// data.course.title = 'data';

data.course.subcourse.subtitle
// data.course.subcourse.subtitle = 'programming'