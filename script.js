const socket = io('http://localhost:3000');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');
const messageContainer = document.getElementById('message-container');

socket.on('message-chat', (message) => {
    appendMessage(message);
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(message)
    socket.emit('send-chat-message', message);
    messageInput.value = '';
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}