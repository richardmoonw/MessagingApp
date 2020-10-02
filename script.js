const socket = io('http://172.16.112.128:3000');
const messageForm = document.getElementById('message-form');
const destinationForm = document.getElementById('destination-form');
const keyForm = document.getElementById('key-form');
const destinationInput = document.getElementById('destination');
const messageInput = document.getElementById('message');
const keyInput = document.getElementById('key');
const messageContainer = document.getElementById('message-container');
const chatName = document.getElementById('chat-name-1');
const chatName2 = document.getElementById('chat-name-2');
const keyValue = document.getElementById('key-value');
import ASCPMessage from './message_template.js';

var key = undefined;

socket.on('external_message', packet => {

    if(key != undefined) {
        var decryption_key = CryptoJS.enc.Hex.parse(key);

        // Convert the array received to Uint8Array (required to perform the following
        // actions).
        packet = Uint8Array.from(packet);

        // Convert the Uint8Array to WordArray and store the returned values inside a
        // property called ciphertext in a new array.
        var cipher_wordArray = convertUint8ArrayToWordArray(packet);
        var ciphertext = {
            ciphertext: {
                words: cipher_wordArray.words,
                sigBytes: cipher_wordArray.sigBytes
            }
        }

        // Perform the encryption with the proper message object and key.
        var decrypted = CryptoJS.DES.decrypt(ciphertext, decryption_key, {
            mode: CryptoJS.mode.ECB
        });

        // Convert the decrypted message to a Uint8Array.
        packet = convertWordArrayToUint8Array(decrypted);
    }

    // Extract only the message from all the packet and append it to the messages.
    var msg_size = packet[9];
    var message = Utf8ArrayToStr(packet, msg_size);
    appendMessage(message, "other");
});

destinationForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();

    const destination = destinationInput.value;
    if (destination == ''){
        chatName.innerHTML = 'General';
        chatName2.innerHTML = 'General';
    }
    else {
        chatName.innerHTML = destination;
        chatName2.innerHTML = destination;
    }
    socket.emit('set-destination', destination);
});

keyForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();

    if(keyInput.value == '') {
        key = undefined;
        keyValue.innerHTML = "No key";
    }
    else {
        key = keyInput.value;
        keyValue.innerHTML = key;
    }   
})

messageForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();
    const message = messageInput.value;
    
    // Create an instance of ASCPMessage and set its data. 
    const message_template = new ASCPMessage();
    message_template.setDatos(message);

    var new_msj = [];

    if(key != undefined){
        // Declare the key to be used for encryption (Hexadecimal format).
        // If we do not do this, the key will be used only as a passphrase to generate
        // the real key and IV.
        var encryption_key = CryptoJS.enc.Hex.parse(key);

        // Convert the message to WordArray. CryptoJS encrpt method can only receive as
        // message parameter a String or a WordArray.
        var message_wordArray = convertUint8ArrayToWordArray(message_template.getDatos());

        // Encrypt the message's WordArray with the given key (ECB mode and no padding).
        var encrypted = CryptoJS.DES.encrypt(message_wordArray, encryption_key, {
            mode: CryptoJS.mode.ECB
        });

        // Encrypt the message, convert the resulting WordArray to an Uint8Array and then
        // convert that Uint8Array to a simple Array to be able to emit it through the socket.
        var encrypted_message = convertWordArrayToUint8Array(encrypted.ciphertext);
        new_msj = Array.from(encrypted_message);
    }
    else {
        new_msj = Array.from(message_template.getDatos())
    }

    // Append the message to the message container and send it to the server socket.
    appendMessage(message, "me");
    socket.emit('send-chat-message', new_msj);
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

// Function used to extract only the message from the message template.
function Utf8ArrayToStr(array, len) {
    var str = '';
    for(var i=20; i<20 + len; i++){
        str += String.fromCharCode(array[i]);
    }
    return str;
}

// Function used to convert a Uint8Array to a WordArray.
function convertUint8ArrayToWordArray(u8Array) {
    var words = [], i = 0, len = u8Array.length;

    while(i < len) {
        words.push(
            (u8Array[i++] << 24) |
            (u8Array[i++] << 16) |
            (u8Array[i++] << 8) |
            (u8Array[i++])
        );
    }

    return {
        sigBytes: words.length * 4,
        words: words
    };
}

// Function used to convert a WordArray to a Uint8Array.
function convertWordArrayToUint8Array(wordArray) {
    var len = wordArray.words.length;
    var u8_array = new Uint8Array(len << 2);
    var offset = 0, word, i;

    for(i=0; i<len; i++) {
        word = wordArray.words[i];
        u8_array[offset++] = word >> 24;
        u8_array[offset++] = word >> 16 & 0xff;
        u8_array[offset++] = word >> 8 & 0xff;
        u8_array[offset++] = word & 0xff;
    }

    return u8_array;
}
