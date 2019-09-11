
/**
 * 比较新老节点差异
 * @param {Object} vdomOld 
 * @param {Object} vdomNew 
 */
function vdomDiff(vdomOld, vdomNew) {
  // 节点名相同 深层检查
  if (vdomOld.nodeType === 3 && vdomNew.nodeType === 3) {
    if (vdomOld.data !== vdomNew.data) {
      console.log('[DIFF] Text', `${vdomOld.data} => ${vdomNew.data}`);
      vdomOld.data = vdomNew.data;
      vdomOld.elem.data = vdomNew.data;
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
  let oldStartIdx = 0,
      oldEndIdx = cdOld.length - 1;
  let newStartIdx = 0,
      newEndIdx = cdNew.length - 1;
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isSameNode(cdOld[oldStartIdx], cdNew[newStartIdx])) {
      cdOld[oldStartIdx] = vdomDiff(cdOld[oldStartIdx], cdNew[newStartIdx]);
      cdNew[newStartIdx++] = cdOld[oldStartIdx++];
    } else if (isSameNode(cdOld[oldEndIdx], cdNew[newEndIdx])) {
      cdOld[oldEndIdx] = vdomDiff(cdOld[oldEndIdx], cdNew[newEndIdx]);
      cdNew[newEndIdx--] = cdOld[oldEndIdx--];
    } else { // 与头部相同一致（可以优化）
      cdOld[oldStartIdx] = vdomDiff(cdOld[oldStartIdx], cdNew[newStartIdx]);
      cdNew[newStartIdx++] = cdOld[oldStartIdx++];
    }
  }
  // 删除多余节点
  for (; oldStartIdx <= oldEndIdx; oldEndIdx--) {
    let oldChild = cdOld[oldStartIdx];
    elemParent.removeChild(oldChild.elem);
    cdOld.splice(oldStartIdx, 1);
    console.log('[DIFF] Rmnd', `${oldChild.nodeName}`, oldChild);
  }
  // 增加新的节点
  let lastChild = cdNew[newEndIdx + 1] ? cdNew[newEndIdx + 1].elem : null;
  for (; newStartIdx <= newEndIdx; newStartIdx++) {
    let newChild = vdom2DomV3(cdNew[newStartIdx]);
    // 插入真实节点
    elemParent.insertBefore(newChild, lastChild);
    // 对齐虚拟节点
    let lastIndex = cdOld.indexOf(lastChild);
    if (lastChild !== -1) {
      cdOld.splice(lastIndex, 0, cdNew[newStartIdx]);
    } else {
      cdOld.push(cdNew[newStartIdx]);
    }
    console.log('[DIFF] Adnd', `${cdNew[newStartIdx].nodeName}`, cdNew[newStartIdx]);
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
      vdomOld.setAttribute(item, valNew);
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
    vdomOld.removeAttribute(item);
    vdomOld.elem.removeAttribute(item);
    console.log('[DIFF] Attr:Rm', `${item}`);
  }
  // [Step 3] 增加新的属性
  let uniqueNew = new Set([...setNew].filter(item => !common.has(item)));
  for (let item of uniqueNew) {
    vdomOld.setAttribute(item, valNew);
    vdomOld.elem.setAttribute(item, valNew);
    console.log('[DIFF] Attr:New', `${item}: ${valNew}`);
  }
}