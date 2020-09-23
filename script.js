const socket = io('http://localhost:3000');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');

socket.on('message-chat', (data) => {
    console.log(data);
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});