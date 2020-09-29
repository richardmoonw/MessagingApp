const socket = io('http://172.16.112.128:3000');
const messageForm = document.getElementById('message-form');
const destinationForm = document.getElementById('destination-form');
const destinationInput = document.getElementById('destination');
const messageInput = document.getElementById('message');
const messageContainer = document.getElementById('message-container');
import ASCPMessage from './message_template.js'

socket.on('external_message', packet => {
    var msg_size = packet[9];
    var message = Utf8ArrayToStr(packet, msg_size);
    appendMessage(message, "other");
});

destinationForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();

    const destination = destinationInput.value;
    socket.emit('set-destination', destination);
});

messageForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();
    const message = messageInput.value;
    
    // Create an instance of ASCPMessage and set its data. 
    const message_template = new ASCPMessage();
    message_template.setDatos(message);

    // Append the message to the message container and send it to the server socket.
    appendMessage(message, "me");
    socket.emit('send-chat-message', message_template.getDatos());
    messageInput.value = '';
});

function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    var formattedMessage = '';
    for(var i=0; i<message.length; i++){
        if(i%50 == 0 && i != 0) {
            formattedMessage += '<br>' + message[i];
        }
        else {
            formattedMessage += message[i];
        }
    }
    if (sender == "me") {
        messageElement.style = 'float: right;'
        messageElement.innerHTML = `<p style="background-color: #dcf8c6; padding: .35rem 0.75rem; border-radius: 0.3rem; margin: 0.5rem 2rem 0rem 2rem;">${formattedMessage}</p>`;
        messageContainer.append(messageElement);
    }

    else if (sender == "other"){
        messageElement.style = 'float: left;'
        messageElement.innerHTML = `<p style="background-color: #fafafa; padding: .35rem 0.75rem; border-radius: 0.3rem; margin: 0.5rem 2rem 0rem 2rem;">${formattedMessage}</p>`;
        messageContainer.append(messageElement);
    }
    
    const cleaner = document.createElement('div');
    cleaner.style = "clear: both; float: left; display: block; position: relative;"
    messageContainer.append(cleaner);
}

function Utf8ArrayToStr(array, len) {
    var str = '';
    for(var i=20; i<20 + len; i++){
        str += String.fromCharCode(array[i]);
    }
    return str;
}

