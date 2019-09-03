
// const test = require('ava');

const mueObserver = require('../../src/data/mue_observer');
// test('deep-A', t => t.pass());

var data = {
  course: {
    title: 'algorithm',
    subcourse: {
      subtitle: 'dynamic'
    },
    books: [
      {name: 'A', year: 1000},
      {name: 'B', year: 2000}
    ]
  }
}
mueObserver(
  data, 
  (key, value, newValue) => console.log('set', key, value, '->', newValue),
  // (key, value) => undefined// console.log('get', key, value)
);
data.course;
data.course.title = 'data';
data.course.subcourse.subtitle = 'programming'

data.course.books[0].name = 'BOOK A'
data.course.books[0].year = 1200

data.course.books.push({name: 'New', year: 3000})

data.course.books[2].name = 'Art'