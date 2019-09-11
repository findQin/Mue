
/**
 * 比较新老节点差异
 * @param {Object} vdomOld 
 * @param {Object} vdomNew 
 */
function vdomDiff(vdomOld, vdomNew) {
  // 节点名相同 深层检查
  if (vdomOld.nodeType === 3 && vdomNew.nodeType === 3) {
    if (vdomOld.data !== vdomNew.data) {
      vdomOld.elem.data = vdomNew.data;
      console.log('[DIFF] Text', `${vdomOld.data} => ${vdomNew.data}`);
    }
  } else if (isSameName(vdomOld, vdomNew)) {
    if (!isSameAttr(vdomOld, vdomNew)) {
      // 不考虑m-modal情况
      updateAttrs(vdomOld, vdomNew);
    }
    // 更新子节点
    patch(vdomOld.childNodes, vdomNew.childNodes, vdomOld.elem);
  } else {
    // 重新渲染
    console.log('[DIFF] Repl', `${vdomOld.nodeName} => ${vdomNew.nodeName}`);
    let newElem = vdom2DomV3(vdomNew);
    vdomOld.elem.replaceWith(newElem);
    return vdomNew;
  }
  return vdomOld;
}

function patch(cdOld, cdNew, elemParent) {
  if (cdOld.length === 0 && cdNew.length === 0) {
    return;
  }
  let startFromLeft = (cdOld.length === 0 || cdNew.length === 0) || isSameNode(cdOld[0], cdNew[0]);
  if (startFromLeft) {
    let oldIndex = 0;
    let newIndex = 0;
    // 更新节点
    for (; oldIndex < cdOld.length && newIndex < cdNew.length; oldIndex++, newIndex++) {
      cdOld[oldIndex] = vdomDiff(cdOld[oldIndex], cdNew[newIndex]);
    }
    // 删除多余旧节点
    for (let i = cdOld.length - 1; i >= oldIndex; i--) {
      let elem = cdOld[i].elem;
      elemParent.removeChild(elem);
      console.log('[DIFF] Rmnd', `${cdOld[i].nodeName}`);
      cdOld.pop();
    }
    // 增加新的子节点
    for (; newIndex < cdNew.length; newIndex++) {
      let elem = vdom2DomV3(cdNew[newIndex]);
      elemParent.appendChild(elem);
      console.log('[DIFF] Adnd', `${cdNew[newIndex].nodeName}`);
      cdOld.push(cdNew[newIndex]);
    }
  } else {

  }
}

function isSameNode(nodeA, nodeB) {
  // [Check 1] 节点tagname检查
  if (!isSameName(nodeA, nodeB)) {
    return false;
  }
  // [Check 2] 节点属性名检查
  return isSameAttr(nodeA, nodeB);
}

// 对比节点标签名
function isSameName(nodeA, nodeB) {
  return (nodeA.nodeName === nodeB.nodeName);
}

// 对比节点属性值
function isSameAttr(nodeA, nodeB) {
  let attrs = nodeA.attributes;
  for (let i = 0; i < attrs.length; i++) {
    let name = attrs[i].name;
    if (nodeA.getAttribute(name) !== nodeB.getAttribute(name)) {
      return false; // 任何不匹配的属性导致错误
    }
  }
  return true;
}

// 文本节点相同对比
function isSameText(nodeA, nodeB) {
  return (nodeA.data === nodeB.data)
      && (nodeA.nodeName === nodeB.nodeName);
}



function updateAttrs(vdomOld, vdomNew) {
  let setOld = new Set(Array.from(vdomOld.attributes).map(item => item.name));
  let setNew = new Set(Array.from(vdomNew.attributes).map(item => item.name));
  // [Step 1] 公共部分进行更新
  let common = new Set([...setOld].filter(item => setNew.has(item)));
  for (let item of common) {
    let valOld = vdomOld.getAttribute(item);
    let valNew = vdomNew.getAttribute(item);
    if (valOld !== valNew) { // update
      vdomOld.elem.setAttribute(item, valNew);
      console.log('[DIFF] Attr:Up', `${item}: ${valOld} => ${valNew}`);
      if (item === 'm-model') {
        // 涉及更新listener 重新绑定（后续重构支持）
      }
    } else if (item === 'm-model') {
      if (window.fullKey && valOld === window.fullKey) {  // TODO 使用全局变量 后续优化点
        vdomOld.elem.value = data[valOld];
        console.log('[DIFF] Attr:Model', `${item}: ${data[valOld]}`);
      }
    }
  }
  // [Step 2] 删除原有属性
  let uniqueOld = new Set([...setOld].filter(item => !common.has(item)));
  for (let item of uniqueOld) {
    vdomOld.elem.removeAttribute(item);
    console.log('[DIFF] Attr:Rm', `${item}`);
  }
  // [Step 3] 增加新的属性
  let uniqueNew = new Set([...setNew].filter(item => !common.has(item)));
  for (let item of uniqueNew) {
    vdomOld.elem.setAttribute(item, valNew);
    console.log('[DIFF] Attr:New', `${item}: ${valNew}`);
  }
}