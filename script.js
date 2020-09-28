const socket = io('http://192.168.1.99:3000');
const messageForm = document.getElementById('message-form');
const destinationInput = document.getElementById('destination');
const messageInput = document.getElementById('message');
const messageContainer = document.getElementById('message-container');
import ASCPMessage from './message_template.js'

socket.on('external_message', message => {
    appendMessage(message)
});

messageForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();
    const message = messageInput.value;
    const destination = destinationInput.value;

    // Create an instance of ASCPMessage and set its data. 
    const message_template = new ASCPMessage();
    message_template.setDatos(message);

    // Append the message to the message container and send it to the server socket.
    appendMessage(message);
    socket.emit('send-chat-message', message_template.getDatos(), destination);
    messageInput.value = '';
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}


