const Koa = require('koa');
const app = new Koa();
const https = require('https');
const fs = require('fs');
const path =require('path');
const { Server } = require("socket.io");
const koaBodyparser = require('koa-bodyparser');

const pages = require('./pages');
const staticSource = require('./static');

app.use(koaBodyparser());
app.use(staticSource);
app.use(pages.routes());

const httpsOpt = {
    key: fs.readFileSync(path.join(__dirname, '../key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../server.pem'))
}

const httpsServer = https.createServer(httpsOpt, app.callback()).listen(4000, () => {
    console.log('listen to 3000');
})

const io = new Server(httpsServer);
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.roomId);
    })
    socket.on('offer', (data) => {
        socket.to(1111).emit('message', data);
    })
    socket.on('answer', (data) => {
        socket.to(1111).emit('message', data);
    })
    socket.on('candidate', (data) => {
        socket.to(1111).emit('message', data);
    })
})
