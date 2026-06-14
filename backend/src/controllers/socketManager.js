
import { Server } from "socket.io";



let connections={}
let messages={}
let timeOnline={}


const connectToSocket =(server)=>{
    const io= new Server(server);

   io.on("connection",(socket)=>{
      socket.on("join-call",(path)=>{
         // Handle join-call event
         if(connections[path]===undefined){
            connections[path]=[socket.id]
         }connections[path].push(socket.id)
      });

      socket.on("signal",(toId,message)=>{
        io.to(toId).emit("signal",socket.id,message);
      })
      socket.on("chat-message",(message)=>{
        // Handle chat-message event
      })
      socket.on("disconnect",()=>{
        // Handle disconnect event
      })
   });
}

export default connectToSocket;