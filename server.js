const io = require('socket.io')(3000);
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

io.on('connection', socket => {
    console.log('new user');
    socket.emit('message-chat', 'Test');
});

var myapp = app.listen(8080);