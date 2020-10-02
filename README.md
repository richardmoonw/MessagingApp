# Messaging App

## Requirements:
Build an instant messaging app that uses ASCP (A Simple Communication Protocol).

### Considerations:
1. The app should be able to send and receive messages using the ASCP protocol. It should have 2 modes of operation: 1) without encryption and 2) with encryption.
2. The user should have the option to encrypt messages for better security, in that case, they would type the key. For this version, it is assumed that all the parties will have the same key (it is not necessary to pass the key through a secure chanel yet).
3. The app have to build the message and encrypt it using DES/ECB (headers must be encrypted too) and then it is transmitted using a TCP socket.
4. This version only implements one type of message, nevertheless, future versions will have more types.
5. If the app receives a message, this should be decrypted and interpreted to know the message type.
6. In this version, the user should enter directly the other parties' IP.
7. Any host (external apps) can begin the communication.
8. App should be able to communicate with other apps using the same mechanism.
9. TCP port must be 2020.
10. UI is required.

## Content:
- bootstrap.css: Bootstrap stylesheet.
- styles.css: Custom stylesheet.
- package.json: Node's package.json.
- index.html: Index page.
- message_template.js: JavaScript file to build the ASCP message.
- server.js: Server's JavaScript file.
- client.js: Client's JavaScript file.

## Instructions to run the app.
1. Clone or download the repository in a given folder.
2. Navigate to the root directory of the project.
3. If it is the first time that you run it, type ```npm install``` to install all the dependencies and create the node_modules folder. (If you prefer, you can install all the dependencies listed in the package.json by yourself).
4. You may need to change some IP directions in the script.js (line 1) and index.html (line 9) files in order to run the app your own server.
5. Run the application with the following command:
```
npm run start
```
