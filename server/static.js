const koaStatic = require('koa-static');
const path = require('path');

module.exports = koaStatic(path.join(__dirname, '../public'));
