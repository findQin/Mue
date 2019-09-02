const copyWhiteList = ['__dom', '__vm'];

function copyObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  return deepCopy(obj);
}

function deepCopy(obj, oriObjArr = [], cpyObjArr = []) {
  let idx = oriObjArr.indexOf(obj);
  if (idx !== -1) {
    return cpyObjArr[idx];
  }
  let ansObj = Array.isArray(obj) ? [] : {};
  oriObjArr.push(obj);
  cpyObjArr.push(ansObj);
  for (let key in obj) {
    if (copyWhiteList.indexOf(key) !== -1) {
      continue;
    }
    let val = obj[key];
    if (val === null || val === undefined || typeof val !== 'object') {
      ansObj[key] = val;
    }
    else {
      ansObj[key] = deepCopy(val, oriObjArr, cpyObjArr);
    }
  }
  return ansObj;
}

// export default copyObject;

// module.exports = copyObject;


// let c1 = {a: 'a', b: 'b'};
// let r1 = copyObject(c1);

// let c2 = {a: [1,2], b: {c: [1], d: 2}};
// let r2 = copyObject(c2);

// let c3 = c2;
// c3.c2 = c2;
// let r3 = copyObject(c3);

// debugger