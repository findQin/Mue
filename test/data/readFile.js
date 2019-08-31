
const fs = require('fs')
const path = require('path')


var content = fs.readFileSync(path.join(__dirname, '../template/simple_A.html'), {encoding: 'utf8'});


debugger;
var afterContent = content.replace(/<!--[\w\W]*-->/g, '')

debugger;