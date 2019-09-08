
//
// VDOM
// 
function VDOM(options = {}) {
  // Node Tag && Type
  this.nodeName = options.nodeName || 'div';
  this.nodeType = options.nodeType || 1;
  // Node Text && Attr
  this.data = options.data || '';
  this.innerText = options.innerText || '';
  this.attributes = options.attributes || {length: 0};
  // Child Nodes
  this.childNodes = options.childNodes || [];
  this.parentNode = options.parentNode || null;
  this.id = options.id || '';
  this.key = options.key || '';
}
VDOM.prototype.getAttribute = function(attrName) {
  return this.attributes[attrName];
}
VDOM.prototype.setAttribute = function(attrName, attrValue) {
  if (!(attrName in this.attributes)) {
    this.attributes[this.attributes.length++] = {
      name: attrName,
      value: attrValue,
    };
  } else {
    for (let i = 0; i < this.attributes.length; i++) {
      if (this.attributes[i].name === attrName) {
        this.attributes[i].value = attrValue;
      }
    }
  }
  this.attributes[attrName] = attrValue;
}
VDOM.prototype.removeAttribute = function(attrName) {
  let index = -1;
  for (let i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name === attrName) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    Array.prototype.splice.call(this.attributes, index, 1);
  }
  delete this.attributes[attrName];
}

//
// String 2 VDOM
//
function template2Vdom(template) {
  // 删除注释 && 前导后置空字符
  template = template.replace(/<!--[\w\W]*-->/g, '');
  template = template.trim();
  // 创建根节点
  let root = new VDOM({nodeName: 'root'});
  let currentNode = root;
  for (let i = 0; i < template.length; ) {
    i = tillNotSpace(template, i);
    if (template[i] === '<') {
      if (template[i + 1] === '/') {
        // CASE 结束标记 </div>
        let endPos = template.indexOf('>', i);
        currentNode = currentNode.parentNode;
        i = endPos + 1; // move to next start
      } else {
        // CASE <div attribute> or <img src="" />
        let info = detectEndPos(template, i, ['>', '/>']);
        let vdom = resolveSimpleTag(template.slice(i, info.endPos + info.endStr.length));
        vdom.parentNode = currentNode;
        currentNode.childNodes.push(vdom);
        if (info.endStr === '>') {
          currentNode = vdom;
        }
        i = info.endPos + info.endStr.length; // move to next start
      }
    } else {
      // 文本节点
      let info = detectEndPos(template, i, ['<']);
      let vdom = new VDOM({
        nodeName: '#text',
        nodeType: 3,
        data: template.slice(i, info.endPos),
        parentNode: currentNode
      });
      currentNode.childNodes.push(vdom);
      i = info.endPos; // < is next start
    }
  }
  return root.childNodes[0];
}


function resolveSimpleTag(tagString) {
  let vdom = new VDOM();
  vdom.nodeName = null;
  for (let i = 1; i < tagString.length; ) {
    i = tillNotSpace(tagString, i);
    if (!vdom.nodeName) {
      // 读取标签
      let nextSpace = tagString.indexOf(' ', i); //<p>123</p>
      let nextRight = tagString.indexOf('>', i);
      let tagEndPos = nextSpace !== -1 ? Math.min(nextSpace, nextRight) : nextRight;
      vdom.nodeName = tagString.slice(i, tagEndPos);
      i = tagEndPos;
    } else {
      // 读取属性
      let matchResult = tagString.slice(i).match(/([^=\s]+)=(['"]?)/);
      if (matchResult) {
        let attrName = matchResult[1];
        let attrEndInfo = detectEndPos(tagString, i, [' ', '>', '/>']);
        let attrValue = tagString.slice(i + matchResult.index + attrName.length + 1, attrEndInfo.endPos);
        if (matchResult[2]) {
          attrValue = attrValue.slice(1, attrValue.length - 1);
        }
        vdom.setAttribute(attrName, attrValue);
        i = attrEndInfo.endPos + 1;
      } else {
        i++; // (>) or (/>) or (unkown)
      }
    }
  }
  return vdom;
}

// [S-FUNC] 查找下一个非空格
function tillNotSpace(template, start) {
  while (template[start] === ' ' && start < template.length) start++;
  return start;
}
// [S-FUNC] 查找下一个空格
function tillNextSpace(template, start) {
  while (template[start] !== ' ' && start < template.length) start++;
  return start;
}

/**
 * [S-FUNC] 根据结束字符串判断结束位置
 * - Support "
 * - Support '
 * - Support {{
 */
function detectEndPos(template, start, endStrs) {
  let stack = [];
  for (let i = start; i < template.length; i++) {
    if (template[i] === '"' || template[i] === '\'') {
      if (stack[stack.length - 1] === template[i]) {
        stack.pop();
      } else {
        stack.push(template[i]);
      }
    } else if (template[i] === '\\') {
      i += 1;
    } else if (template[i] === '{' && template[i + 1] === '{') {
      stack.push('}');
      i += 1;
    } else if (template[i] === '}' && template[i + 1] === '}') {
      if (stack[stack.length - 1] === template[i]) {
        stack.pop();
      }
      i += 1;
    } else {
      for (let endStr of endStrs) {
        if (stack.length === 0 && template.slice(i, i + endStr.length) === endStr) {
          endS = endStr;
          return { endStr, endPos: i };
        }
      }
    }
  }
  return {
    endStr: '',
    endPos: template.length - 1
  }
}


// var temp = '<a href="http://m.ba\\\\\\"idu.com" m-if="{{show>1 ? \'/\' : \'/>\'}}" year=123/>';
// let res = resolveSimpleTag(temp, 0);
// debugger;

// var temp1 = `<a href="http://m.baidu.com" m-if="{{show}}" year=123/>`;
// var vdom1 = template2Vdom(temp1);
// debugger;

// var temp2 = `
// <!-- Here is comment-->
// <view id="bottom">
//   <view class='tips'>需完成全部挑战后领取</view>
//   <view class="btn {{(satisfyCondition || isUserObtained) ? 'color':''}}" bindtap='onBottomBtnClicked'>{{buttonText}}</view>
// </view>
// `
// var vdom2 = template2Vdom(temp2);
// debugger;

// var temp3 = `
// <view id="box-example">
//   <view id="auto-width-check-box" style="background-color:rgb(134, 166, 151)">
//     <view id="sub-1" class="box-with-percent-width-value" style="background-color:rgb(37, 83, 89)"></view>
//     <view class="box-with-text" style="background-color:rgb(180, 129, 187)">here is A textConte</view>
//     <view class="box-with-percent-width-value" style="background-color:rgb(38, 30, 71);position: absolute;width: 30%; height: 150rpx;"></view>
//     <view class="box-with-percent-width-value" style="background-color:rgb(37, 83, 89)"></view>
//   </view>
// </view>
// `;
// var vdom3 = template2Vdom(temp3);


// var temp4 = `
// <view id="answer_area" wx:if="!isDone">
//   <view id="answer-area-wrapper" style="transform: translate({{answerTextPanelPosition}}, 0);">

//     <view class='answer-text-level1-container'>
//       <view class='st-title'>
//         <text>1<span>/5</span></text>
//         <text>请选择你的性别</text>
//       </view>
//       <view class='st-buttons-wrapper'>
//         <view class='st-buttons-wrapper-inner'>
//           <view class='st-buttons {{answerTextLevelSelected.level1 === 1? "selected" : ""}}' id="btn-1-1" catchtap='onTapLevelButton'>男</view>
//           <view class='st-buttons {{answerTextLevelSelected.level1 === 2? "selected" : ""}}' id="btn-2-1" catchtap='onTapLevelButton'>女</view>
//         </view>
//       </view>
//     </view>
//     <view class='answer-text-level2-container'>
//       <view class='st-title'>
//         <text>2<span>/5</span></text>
//         <text>你有爱车吗</text>
//       </view>
//       <view class='st-buttons-wrapper'>
//         <view class='st-buttons-wrapper-inner'>
//           <view class='st-buttons {{answerTextLevelSelected.level2 === 1? "selected" : ""}}' id="btn-1-2" catchtap='onTapLevelButton'>有</view>
//           <view class='st-buttons {{answerTextLevelSelected.level2 === 2? "selected" : ""}}' id="btn-2-2" catchtap='onTapLevelButton'>没有</view>
//         </view>
//       </view>
//     </view>
//     <view class='answer-text-level3-container'>
//       <view class='st-title'>
//         <text>3<span>/5</span></text>
//         <text>你有宠物吗</text>
//       </view>
//       <view class='st-buttons-wrapper'>
//         <view class='st-buttons-wrapper-inner'>
//           <view class='st-buttons {{answerTextLevelSelected.level3 === 1? "selected" : ""}}' id="btn-1-3" catchtap='onTapLevelButton'>有</view>
//           <view class='st-buttons {{answerTextLevelSelected.level3 === 2? "selected" : ""}}' id="btn-2-3" catchtap='onTapLevelButton'>没有</view>
//         </view>
//       </view>
//     </view>
//     <view class='answer-text-level4-container'>
//       <view class='st-title'>
//         <text>4<span>/5</span></text>
//         <text>你现在的状态</text>
//       </view>
//       <view class='st-buttons-wrapper'>
//         <view class='st-buttons-wrapper-inner'>
//           <view class='st-buttons {{answerTextLevelSelected.level4 === 1? "selected" : ""}}' id="btn-1-4" catchtap='onTapLevelButton'>单身中</view>
//           <view class='st-buttons {{answerTextLevelSelected.level4 === 2? "selected" : ""}}' id="btn-2-4" catchtap='onTapLevelButton'>恋爱</view>
//           <view class='st-buttons {{answerTextLevelSelected.level4 === 3? "selected" : ""}}' id="btn-3-4" catchtap='onTapLevelButton'>已婚</view>
//         </view>
//       </view>
//     </view>
//     <view class='answer-text-level5-container'>
//       <view class='st-title'>
//         <text>5<span>/5</span></text>
//         <text>你有宝宝吗</text>
//       </view>
//       <view class='st-buttons-wrapper'>
//         <view class='st-buttons-wrapper-inner'>
//           <view class='st-buttons-wrapper5-inner'>
//             <view class='st-buttons {{answerTextLevelSelected.level5 === 1? "selected" : ""}}' id="btn-1-5" catchtap='onTapLevelButton'>有无宝宝</view>
//             <view class='st-buttons {{answerTextLevelSelected.level5 === 2? "selected" : ""}}' id="btn-2-5" catchtap='onTapLevelButton'>0-1岁</view>
//             <view class='st-buttons {{answerTextLevelSelected.level5 === 3? "selected" : ""}}' id="btn-3-5" catchtap='onTapLevelButton'>2-6岁</view>
//           </view>
//           <view class='st-buttons-wrapper5-mode-inner'>
//             <view class='st-buttons {{answerTextLevelSelected.level5 === 4? "selected" : ""}}' id="btn-4-5" catchtap='onTapLevelButton'>7-16岁</view>
//             <view class='st-buttons {{answerTextLevelSelected.level5 === 5? "selected" : ""}}' id="btn-5-5" catchtap='onTapLevelButton'>16岁以上</view>
//             <view class='st-buttons {{answerTextLevelSelected.level5 === 6? "selected" : ""}}' id="btn-6-5" catchtap='onTapLevelButton'>保密</view>
//           </view>
//         </view>
//       </view>
//     </view>
//   </view>
// </view>
// `
// var vdom4 = template2Vdom(temp4);

// export default template2Vdom;