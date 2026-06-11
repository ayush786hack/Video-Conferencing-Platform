# Video Conferencing Platform

A real-time video conferencing platform that enables users to create and join virtual meetings with high-quality audio, video, and screen sharing capabilities. The platform is designed to provide seamless communication and collaboration for teams, students, and professionals.

## Features

* User Authentication (Login & Signup)
* Create and Join Meeting Rooms
* Real-time Video and Audio Communication
* Screen Sharing
* Chat Messaging During Meetings
* Meeting Link Sharing
* Mute/Unmute Audio
* Turn Camera On/Off
* Responsive User Interface
* Secure Peer-to-Peer Communication

## Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Real-Time Communication

* WebRTC
* Socket.IO

### Database

* MongoDB

## Project Structure

```bash
video-conferencing-platform/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── socket/
│   └── server.js
│
├── README.md
└── package.json
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/video-conferencing-platform.git
cd video-conferencing-platform
```

### Install Dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd ../server
npm install
```

## Environment Variables

Create a `.env` file in the server directory and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Running the Application

Start Backend:

```bash
npm start
```

Start Frontend:

```bash
cd client
npm start
```

The application will be available at:

```text
http://localhost:3000
```

## How It Works

1. Users register and log in.
2. A user creates a meeting room.
3. A unique room ID is generated.
4. Participants join using the room ID or invitation link.
5. WebRTC establishes peer-to-peer media connections.
6. Socket.IO handles signaling and real-time communication.
7. Users can communicate through video, audio, chat, and screen sharing.

## Future Enhancements

* Meeting Recording
* Virtual Backgrounds
* AI-Based Noise Cancellation
* Breakout Rooms
* Live Transcription
* Meeting Scheduling
* Participant Analytics

## Contributors

* Ayush
* Team Members

## License

This project is licensed under the MIT License.
