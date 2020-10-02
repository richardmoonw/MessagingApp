const io = require('socket.io')(3000);
const express = require('express');
const net = require('net');
const app = express();

// Variable used to define an external socket.
var c = undefined;

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

// Routing function to provide the styles.css file to the index page.
app.get('/styles.css', (req, res) => {
    res.sendFile(__dirname + '/styles.css');
})

// Socket.io function used to detect if a new client is connected to the given socket.
io.on('connect', socket => {
    console.log('Own client connected');

    // Function used to start listening for socket events with the specified event name. 
    socket.on('send-chat-message', (message) => {
        var bufferedMessage = Buffer.from(message);

        // Emit a message to all the clients connected to the socket.
        socket.broadcast.emit('external_message', message);

        // If there is an external socket defined, then send the message to it.
        if (c) {
            c.write(bufferedMessage);
        }
    });

    // If the client has defined an external destination.
    socket.on('set-destination', destination => {

        // If destination is not empty, create a new socket pointing to it.
        if (destination != '') {

            // If there is not defined a external socket yet.
            if (c != undefined) {
                c.destroy();
            }

            c = net.createConnection(2020, destination);
            c.on('connect', () => {
                console.log("Connection established")
            });
            c.on('data', (data) => {
                var packet = Array.prototype.slice.call(data, 0);
                socket.emit('external_message', packet)
            });
            c.on('close', () => {
                if(c) {
                    console.log("External client disconnected");
                    c.destroy();
                }
                c = undefined;
            })
        }

        // If destination was not specified
        else {
            if(c) {
                console.log("Killed connection to external server");
                c.destroy();
            }
            c = undefined;
        }
    });

    // Client dies.
    socket.on('disconnect', () => {
        if (c) {
            console.log("Connection killed")
            c.destroy();
            c = undefined;
        }
    });
});

// Create a "new" server to be listening at port 2020.
const server = new net.Server((socket) => {
    console.log("External client connected");

    // Make the new socket an external variable.
    c = socket

    // Connection with a client dies.
    socket.on('close', () => {
        // if(c) {
        //     c.destroy();
        //     c = undefined;
        // }
        socket.destroy();
        console.log("Client disconnected");
    });

    // Receive data from other servers and send it to the client.
    socket.on('data', (data) => {
        var packet = Array.prototype.slice.call(data, 0);
        io.emit('external_message', packet);
    })
});

server.listen(2020, () => {
    console.log("Server is listening on port: " + server.address().port);
});

// Function used to initialize a server and start listening at a given port.
app.listen(8080);