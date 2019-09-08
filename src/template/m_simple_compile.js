
// import copyObject from '../utils/copy_object.js';
// import template2Vdom from './template_2_vdom.js';

// [M-FUNC] (简单)模板编译
function mSimpleCompile(template, data) {
  var vdom = template2Vdom(template);
  return compileNodes(vdom, data);
}

// [S-FUNC] 节点编译
function compileNodes(node, data) {
  // process with if
  if (!(node = resolveIf(node, data))) {
    return null;
  }
  // process with for
  let preResult = null;
  if ((preResult = resolveFor(node, data))) {
    return preResult;
  }
  // normal process
  if (node.nodeType === 3) {
    node = compileContent(node, data);
  } else {
    node = compileAttrs(node, data);
  }
  let children = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    let result = compileNodes(node.childNodes[i], data);
    result && (children = children.concat(result));
  }
  node.childNodes = children;
  return node;
}

// [S-FUNC] 节点属性编译
function compileAttrs(node, data) {
  let attrs = node.attributes;
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i].name;
    let value = attrs[i].value;
    if (needCompile(value)) {
      node.setAttribute(attr, resolveData(value, data));
    }
  }
  return node;
}

// [S-FUNC] 节点内容编译
function compileContent(node, data) {
  if (needCompile(node.data)) {
    node.data = resolveData(node.data, data);
  }
  return node;
}

// [S-FUNC] 是否需要根据data来编译
function needCompile(value) {
  return value.indexOf('{{') !== -1;
}

// [S-FUNC] 解析data数据
function resolveData(text, data) {
  with (data) {
    return text.replace(/{{([^}]*)}}/g, function(s0, s1){
      return eval(s1);
    });
  }
}

function resolveRawData(text, data) {
  let result = null;
  with (data) {
    text.replace(/{{([^}]*)}}/g, function(s0, s1){
      result = eval(s1);
    });
  }
  return result;
}

// [S-FUNC] 解析m-if关键字
function resolveIf(node, data) {
  let condition = node.getAttribute('m-if');
  if (condition) {
    node.removeAttribute('m-if');
    condition = needCompile(condition) ? resolveRawData(condition, data) : condition;
    return condition ? node : null;
  }
  return node;
}

// [S-FUNC] 解析m-for关键字
function resolveFor(node, data) {
  let content = node.getAttribute('m-for');
  if (content) {
    node.removeAttribute('m-for');
    content = resolveRawData(content, data);
    let replaceNodes = (content || []).map((item, index) => {
      let cpNode = copyObject(node);
      return compileNodes(cpNode, Object.assign({}, data, {index, item})); // item、index 覆盖data中值
    });
    return replaceNodes;
  }
  return null;
}


// export default mSimpleCompile;
// module.exports = simpleCompile;