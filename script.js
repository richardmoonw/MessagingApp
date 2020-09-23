const socket = io('http://localhost:3000');

socket.on('message-chat', (data) => {
    console.log(data);
});