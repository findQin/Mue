
// [M-FUNC] 虚拟节点转换真实节点
function vdom2DomV2(vdom, data) {
  var dom = (vdom.nodeType === 1) ?
    document.createElement(vdom.nodeName) : 
    document.createTextNode(vdom.data);
  for (let i = 0; i < vdom.attributes.length; i++) {
    let attr = vdom.attributes[i];
    dom.setAttribute(attr.name, attr.value);
    if (attr.name === 'm-model') {
      dom.addEventListener('input', e => {
        data[attr.value] = e.target.value
      })
      dom.value = data[attr.value];
    }
  }
  for (let i = 0; i < vdom.childNodes.length; i++) {
    let child = vdom.childNodes[i];
    dom.appendChild(vdom2DomV2(child, data));
  }
  return dom;
}