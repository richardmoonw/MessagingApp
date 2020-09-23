const io = require('socket.io')(3000);
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});

app.get('/bootstrap.css', (req, res) => {
    res.sendFile(__dirname + '/bootstrap.css');
})

io.on('connect', socket => {
    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', message)
    });
});

var myapp = app.listen(8080);