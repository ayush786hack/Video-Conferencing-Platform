import React from 'react';
import { useRef, useState } from 'react';

const server_url ="http://localhost:8000";

  var connections =useRef({}); 
    const peerConfigConnections ={
         "iceServers":[
            {
                "urls":"stun:stun.l.google.com:19302"
            }
         ]
    }

export default function VideoMeet(){
 
      var socketRef=useRef();
      var socketIdRef=useRef();

      let localVideoRef =useRef();
      let [videoAvailable,setVideoAvailable]=useState(true);
      let [audioAvailable,setAudioAvailable]=useState(true);
      let [video,setVideo]=useState();
      let [audio,setAudio]=useState();
      let [screen,setScreen]=useState();
      let [showModal,setModal]=useState();
      let [screenAvailable,setScreenAvailable]=useState();
      let [messages,setMessages]=useState([]);
      let [message,setMessage]=useState("");
      let [newMessages,setNewMessages]=useState(0);
      let [askForUsername,setAskForUsername]=useState(true);
      let [username,setUsername]=useState("");
      const videoRef =useRef([]);
      let [video ,setVideo]=useState([]);

      
    return(
    <div>
       <h1>dgdsgf</h1>
    </div>
    )
}