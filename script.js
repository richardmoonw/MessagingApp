const socket = io('http://172.16.112.128:3000');
const messageForm = document.getElementById('message-form');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const destinationForm = document.getElementById('destination-form');
const destinationInput = document.getElementById('destination');
const messageInput = document.getElementById('message');
const messageContainer = document.getElementById('message-container');
const chatName = document.getElementById('chat-name-1');
const chatName2 = document.getElementById('chat-name-2');
const keyValue = document.getElementById('key-value');
const falseMac = document.getElementById('mac');
const objectParagraph = document.getElementById('objectId');
const userParagraph = document.getElementById('user_token');
var user_token = '';
var objectId = '';
const myIP = '172.16.112.128'
import ASCPMessage from './message_template.js';
import * as bigintCryptoUtils from './lib/index.browser.bundle.mod.js'

var key = undefined;
var alpha = 17123207, q = 2426697107;
var x = parseInt(Math.floor(Math.random() * (q-1))) + 1;

socket.on('no_key', trash => {
    key = undefined;
    keyValue.innerHTML = 'No key';
});

socket.on('external_message', packet => {
    if(key == undefined) {
        var functionType = packet[11];
        let msg_size = packet[9];
        let message = Utf8ArrayToStr(packet, 20, msg_size);
        if (functionType == 1) {
            // Append the received message to the messages.
            appendMessage(message, "other");
        }
        else if (functionType == 2 || functionType == 3){
            var dfHellParameters = message.split(",");
            var otherY = parseInt(dfHellParameters[2].slice(2));

            if (functionType == 2) {
                q = parseInt(dfHellParameters[0].slice(2));
                alpha = parseInt(dfHellParameters[1].slice(2));
                x = parseInt(Math.floor(Math.random() * (q-1))) + 1;
                let messageTemplate = new ASCPMessage();
                let y = calculateY(alpha, q, x);               
                messageTemplate.setInitMessages(3, alpha, q, y);
                let msj = Array.from(messageTemplate.getDatos());
                socket.emit('send-chat-message', msj);
            }
            calculateKey(q, otherY, x);
            addPadding();

            keyValue.innerHTML = key;
        }
    }
    else if(key != undefined) {
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

        // Calculate the mac
        const messageToHash = packet.slice(0, 236);
        let calculatedMac = CryptoJS.SHA1(convertUint8ArrayToWordArray(messageToHash));
        calculatedMac = convertWordArrayToUint8Array(calculatedMac);

        let receivedMac = packet.slice(236, 256);

        if(JSON.stringify(calculatedMac) != JSON.stringify(receivedMac)) {
            alert("Incorrect Mac")
        } 
        else {
            // Extract only the message from all the packet and append it to the messages.
            let msg_size = packet[9];
            let message = Utf8ArrayToStr(packet, 20, msg_size);
            appendMessage(message, "other");
        }
    }
});

destinationForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();

    const destination = destinationInput.value;

    async function getUserIP() {
        const ip = await getIP(destination);
        var destinationIP = ip[0].last_ip;
        
        if (destination == ''){
            chatName.innerHTML = 'General';
            chatName2.innerHTML = 'General';
        }
        else {
            chatName.innerHTML = destinationIP;
            chatName2.innerHTML = destinationIP;
        }
        socket.emit('set-destination', destinationIP);
        if (destination != '') {
            let y = calculateY(alpha, q, x);
            let messageTemplate = new ASCPMessage();
            messageTemplate.setInitMessages(2, alpha, q, y);
            let msj = Array.from(messageTemplate.getDatos());
            socket.emit('send-chat-message', msj);
        }
    }
    getUserIP();
});

// Function used when login form submitted.
loginForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();

    // Declare the required variables
    const email = emailInput.value;
    const pass = passwordInput.value;
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
        const myRequest = new Request('https://api.backendless.com/9176FE65-2FB5-2B00-FFED-BEB6A480BC00/0397420A-AA65-4BA2-9A1F-D4C9583099C8/users/login', 
                                        {method: 'POST', 
                                         body: `{"login": "${email}", "password": "${pass}"}`,
                                         headers: myHeaders});

        function asyncCall() {
            return fetch(myRequest)
                .then(response => {
                    if (response.status === 200) {
                        return response.json()
                    } else {
                        throw new Error('Something went wrong on api server!');
                    }
                })
        }
        async function asyncCall2(){
            const user_data = await asyncCall()
            user_token = user_data["user-token"]
            objectId = user_data.objectId
            objectParagraph.innerHTML = objectId;
            userParagraph.innerHTML = user_token;
            await setIP()
        }

        asyncCall2();
});

messageForm.addEventListener('submit', e => {
    // Avoid page reloading when submitting a form.
    e.preventDefault();

    // Declare the required variables
    const message = messageInput.value;
    
    // Create an instance of ASCPMessage and set its data. 
    let message_template = new ASCPMessage();
    message_template.setDatos(message);

    // Declare the mac
    let mac = []

    // Calculate the MAC
    if (falseMac.checked == true){
        mac = CryptoJS.SHA1("0");
    }
    else {
        const messageToHash = message_template.getDatos().slice(0,236);
        mac = CryptoJS.SHA1(convertUint8ArrayToWordArray(messageToHash));
    }
    mac = convertWordArrayToUint8Array(mac);
    message_template.setMac(mac);

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

function setIP() {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('user-token', user_token);
        const myRequest = new Request(`https://api.backendless.com/9176FE65-2FB5-2B00-FFED-BEB6A480BC00/0397420A-AA65-4BA2-9A1F-D4C9583099C8/data/Users/${objectId}`, 
                                        {method: 'PUT', 
                                         body: `{"last_ip": "${myIP}"}`,
                                         headers: myHeaders});

    return fetch(myRequest)
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                throw new Error('Something went wrong on api server!');
            }
        })
}

function getIP(email) {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('user-token', user_token);
        const myRequest = new Request(`https://api.backendless.com/9176FE65-2FB5-2B00-FFED-BEB6A480BC00/0397420A-AA65-4BA2-9A1F-D4C9583099C8/data/Users?where=email%3D%27${email}%27`, 
                                        {method: 'GET', headers: myHeaders});

    return fetch(myRequest)
        .then(response => {
            if (response.status === 200) {
                return response.json()
            } else {
                throw new Error('Something went wrong on api server!');
            }
        })
}

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
function Utf8ArrayToStr(array, startAt, len) {
    var str = '';
    for(var i=startAt; i<startAt + len; i++){
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

 // Function used to calculate public Y given alpha, Q, and X.
 function calculateY(alpha, q, x) {

    // Fast exponentiation
    var y = bigintCryptoUtils.modPow(alpha, x, q);
    y = parseInt(y);
    return y;
}

// Function used to calculate the key given Q, X and other's Y.
function calculateKey(q, otherY, x) {

    // Fast exponentiation
    let internalKey = bigintCryptoUtils.modPow(otherY, x, q);
    key = parseInt(internalKey);
}

function addPadding() { 
    const key_size = 16;
    key = key.toString(16);
    const actual_size = key.toString().length;
    const zeros = key_size - actual_size;
    var new_key = ''
    for(var i = 1; i <= zeros; i++){
        new_key = new_key + '0';
    }
    key = new_key + key;
}
