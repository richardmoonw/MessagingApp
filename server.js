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

// Routing function to provide the message_template.js file to the index page.
app.get('/message_template.js', (req, res) => {
    res.sendFile(__dirname + '/message_template.js');
});

// Routing function to provide the bootstrap.css file to the index page.
app.get('/bootstrap.css', (req, res) => {
    res.sendFile(__dirname + '/bootstrap.css');
});

// Socket.io function used to detect if a new client is connected to the given socket.
io.on('connect', socket => {
    console.log('Own client connected');

    // Function used to start listening for socket events with the specified event name. 
    socket.on('send-chat-message', (message, destination) => {
        var bufferedMessage = Buffer.from(message, 'ascii');

        // Emit a message to all the clients connected to the socket.
        socket.broadcast.emit('external_message', message);

        // If it is an external destination (not this server), create a new socket and send the message.
        if (destination != '') {
            var c = net.createConnection(2022, destination);
            c.on("connect", () => {
                c.write(bufferedMessage);
                c.destroy();
            });
        }
    });
});

// Create a "new" server to be listening at port 2020.
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