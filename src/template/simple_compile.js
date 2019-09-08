
// [M-FUNC] (简单)模板编译
function simpleCompile(template, data) {
  let root = document.createElement('div');
  root.innerHTML = template.trim();
  console.assert(root.childNodes.length === 1, 'template must has only one root node');
  return compileNodes(root.childNodes[0], data);
}

// [S-FUNC] 节点编译
function compileNodes(node, data) {
  if (node.nodeType === 3) {
    node = compileContent(node, data);
  } else {
    node = compileAttrs(node, data);
  }
  for (let i = 0; i < node.childNodes.length; i++) {
    node.childNodes[i] = compileNodes(node.childNodes[i], data)
  }
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
      return eval(s1);// {{"}}"}} 时解析出错
    });
  }
}

// module.exports = simpleCompile;