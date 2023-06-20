const Router = require('@koa/router');
const path = require('path');
const fs = require('fs');

const router = new Router({
    prefix: '/app'
});

router.get('/index', async (ctx) => {
    const html = fs.readFileSync(path.join(__dirname, '../public/index.html'));
    ctx.body = html.toString();
})

module.exports = router;
