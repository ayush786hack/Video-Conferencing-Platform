import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // ---------- Join a call ----------
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = Date.now();

      // Tell everyone in the room (including the new joiner) who's here now
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      // Replay any messages already sent in this room to the new joiner
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a].data,
            messages[path][a].sender,
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    // ---------- WebRTC signaling relay ----------
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // ---------- Chat ----------
    socket.on("chat-message", (message) => {
      // Find which room this socket belongs to
      let matchingRoom = null;
      for (const [roomKey, roomValue] of Object.entries(connections)) {
        if (roomValue.includes(socket.id)) {
          matchingRoom = roomKey;
          break;
        }
      }

      if (matchingRoom === null) return;

      if (messages[matchingRoom] === undefined) {
        messages[matchingRoom] = [];
      }
      messages[matchingRoom].push({
        data: message,
        sender: socket.id,
        "socket-id-sender": socket.id,
      });

      connections[matchingRoom].forEach((elem) => {
        io.to(elem).emit("chat-message", message, socket.id, socket.id);
      });
    });

    // ---------- Disconnect cleanup ----------
    socket.on("disconnect", () => {
      const diffTime = Math.abs(Date.now() - (timeOnline[socket.id] || Date.now()));

      for (const [key, members] of Object.entries(connections)) {
        const index = members.indexOf(socket.id);
        if (index === -1) continue;

        // Tell remaining members this socket left, before removing it
        members.forEach((memberId) => {
          io.to(memberId).emit("user-left", socket.id, diffTime);
        });

        members.splice(index, 1);

        if (members.length === 0) {
          delete connections[key];
          delete messages[key];
        }

        break; // a socket can only belong to one room
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};

export default connectToSocket;