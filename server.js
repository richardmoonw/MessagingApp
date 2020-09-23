const io = require('socket.io')(3000);
const express = require('express');
const net = require('net');
const app = express();

// Routing function to provide the index page.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Routing function to provide the script.js file to the index page.
app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});

// Routing function to provide the bootstrap.css file to the index page.
app.get('/bootstrap.css', (req, res) => {
    res.sendFile(__dirname + '/bootstrap.css');
});

// Socket.io function used to detect if a new client is connected to the given socket.
io.on('connect', socket => {
    console.log('Own client connected');

    // Function used to start listening for socket events with the specified event name. 
    socket.on('message', message => {
        console.log(message.toString());
    });
    socket.on('send-chat-message', message => {
        console.log(message);
        var c = net.createConnection(2022, '127.0.0.1');
        c.on("connect", () => {
            c.write('Hello, server! Love, Client.');
        });
    });
});

const server = net.createServer((socket) => {
    console.log("Client connected");

    socket.on('end', () => {
        console.log("Client disconnected");
    });

    socket.on('data', (data) => {
        io.emit('external_message', data.toString());
    })
});

server.listen(2020, () => {
    console.log("Server is listening on port: " + server.address().port);
});

// Function used to initialize a server and start listening at a given port.
app.listen(8080);