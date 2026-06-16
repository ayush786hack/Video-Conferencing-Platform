import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      // Handle join-call event
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = Date.now();
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path],
        );
      }
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a].data,
            messages[path]["sender"],
            messages[path][a]["socket-id-sender"],
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });
    socket.on("chat-message", (message) => {
      // Handle chat-message event
      const [matchingRoom,found]=Object.entries(connections)
      .reduce(([room, isFound], [roomKey, roomValue])=>{
         if(!isFound && roomValue.includes(socket.id)){
            return [roomKey, true];
         }
         return [room, isFound];
      },[null, false]);
      if(found===true){
         if(messages[matchingRoom]===undefined){
            messages[matchingRoom]=[];
         }
         messages[matchingRoom].push({
            data: message,
            sender: socket.id,
            "socket-id-sender": socket.id,
         });

         connections[matchingRoom].forEach((elem) => {
            io.to(elem).emit("chat-message", message, socket.id, socket.id);
         });
      }


    });
    socket.on("disconnect", () => {
      // Handle disconnect event
      var diffTime =Math.abs(Date.now() - timeOnline[socket.id]);

      var key

      for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
         for(let a=0;a<v.length;++a){
            if(v[a]===socket.id){
               key=k;

               for(let a=0;a<connections[key].length;++a){
                  io.to(connections[key][a]).emit("user-left", socket.id, diffTime);
               }

               var index = connections[key].indexOf(socket.id);
               
                  connections[key].splice(index, 1);
                  if(connections[key].length===0){
                     delete connections[key];
                     delete messages[key];
                  }
               
            }
         }
      }
    });
  });
};

export default connectToSocket;
