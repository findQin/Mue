import test from 'ava';
const simpleObserver = require('../../src/data/simple_observer')

// For test 1 (Simple Get)
test('simple-get', t => {
  let data = {
    title: 'Mue',
    year: 9102,
  };
  const onSet = (key, value, newValue) => {
    console.log('set', key, value, '->', newValue)
  };
  const onGet = (key, value) => {
    console.log('get', key, value);
    t.pass();
  };
  simpleObserver(data, onSet, onGet);
  data.title;
});
// For test 2 (Simple Set)
test('simple-set', t => {
  let data = {
    title: 'Mue',
    year: 9102,
  };
  const onSet = (key, value, newValue) => {
    console.log('set', key, value, '->', newValue);
    t.pass();
  };
  const onGet = (key, value) => {
    console.log('get', key, value);
  };
  simpleObserver(data, onSet, onGet);
  data.title = 'Vue';
});
