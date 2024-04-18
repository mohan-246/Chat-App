# Chat App

A simple chat application built with [React](https://reactjs.org/), [Node.js](https://nodejs.org/), [Socket.IO](https://socket.io/), and [MongoDB](https://www.mongodb.com/). Users can engage in private and group chats.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Client](#client)
- [Server](#server)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time chat functionality
- Private and group chat options
- User authentication
- End to End encryption
- MongoDB integration for storing chat data
- Responsive UI
- User Profile Customization

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine
- MongoDB installed and running (either locally or on a cloud service)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (if using a cloud service)

## Getting Started

### Client

cd client
npm install
npm run dev
The above commands will navigate to the client directory, install the necessary dependencies, and start the development server.

### Server
bash
Copy code
cd server
npm install
nodemon index.js
The above commands will navigate to the server directory, install the necessary dependencies, and start the Node.js server using Nodemon.

Make sure to configure your MongoDB connection in the server's index.js file.

### Usage
Open your browser and navigate to http://localhost:5173 to access the chat app.
Sign in or register to start chatting.
Create private or group chats, or join existing ones.
Enjoy real-time communication with other users securely!

### Contributing
Contributions are welcome! Feel free to submit issues or pull requests.

### License
This project is licensed under the MIT License.
