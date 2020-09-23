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
});

io.on('connect', socket => {
    console.log('new user');
    socket.on('send-chat-message', message => {
        console.log(message);
        socket.broadcast.emit('message-chat', message)
    });
});

app.listen(8080, () => {

});