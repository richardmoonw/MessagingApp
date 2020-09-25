const socket = io('http://192.168.1.99:3000');
const messageForm = document.getElementById('message-form');
const destinationInput = document.getElementById('destination');
const messageInput = document.getElementById('message');
const messageContainer = document.getElementById('message-container');


socket.on('message-chat', (message) => {
    appendMessage(message);
});

socket.on('external_message', message => {
    appendMessage(message)
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    const destination = destinationInput.value;
    appendMessage(message);
    socket.emit('send-chat-message', message, destination);
    messageInput.value = '';
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}