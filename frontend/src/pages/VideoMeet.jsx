import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const server_url = "http://localhost:8000";

const peerConfigConnections = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

const AVATAR_COLORS = ["#f4a26f", "#ff8a5b", "#7c8bdb", "#5b8def", "#e0a96d"];

function colorForId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function VideoMeet() {
  const connections = useRef({});
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const chatEndRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const [videos, setVideos] = useState([]); // [{ socketId, stream }]
  const [connectionStatus, setConnectionStatus] = useState("Connecting");
  const [clock, setClock] = useState("");

  // ---------- Live clock for the header ----------
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Permissions / local media ----------
  const getPermissions = async () => {
    try {
      const videoStream = await navigator.mediaDevices
        .getUserMedia({ video: true })
        .catch(() => null);
      setVideoAvailable(!!videoStream);
      if (videoStream) videoStream.getTracks().forEach((t) => t.stop());

      const audioStream = await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .catch(() => null);
      setAudioAvailable(!!audioStream);
      if (audioStream) audioStream.getTracks().forEach((t) => t.stop());

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
    } catch (error) {
      console.error("Error fetching media permissions:", error);
    }
  };

  useEffect(() => {
    getPermissions();
    return () => {
      try {
        window.localStream?.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      Object.values(connections.current).forEach((conn) => conn.close());
      socketRef.current?.disconnect();
    };
  }, []);

  // ---------- Replace outgoing stream on all peer connections ----------
  const replaceStreamOnConnections = (stream) => {
    for (const id in connections.current) {
      if (id === socketIdRef.current) continue;
      const conn = connections.current[id];

      const senders = conn.getSenders();
      senders.forEach((sender) => conn.removeTrack(sender));
      stream.getTracks().forEach((track) => conn.addTrack(track, stream));

      conn.createOffer()
        .then((description) => conn.setLocalDescription(description))
        .then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: conn.localDescription })
          );
        })
        .catch((e) => console.error(e));
    }
  };

  const handleTrackEnded = () => {
    setVideo(false);
    setAudio(false);
    try {
      const tracks = localVideoRef.current?.srcObject?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    } catch (e) {
      console.error("Error stopping tracks:", e);
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    replaceStreamOnConnections(stream);

    stream.getTracks().forEach((track) => {
      track.onended = handleTrackEnded;
    });
  };

  const getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: video && videoAvailable,
          audio: audio && audioAvailable,
        });
        getUserMediaSuccess(stream);
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const tracks = localVideoRef.current?.srcObject?.getTracks() || [];
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, audio]);

  // ---------- Screen share ----------
  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    replaceStreamOnConnections(stream);

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);
        getUserMedia();
      };
    });
  };

  const getDisplayMedia = async () => {
    if (screen && screenAvailable) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        getDisplayMediaSuccess(stream);
      } catch (e) {
        console.log(e);
        setScreen(false);
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      if (screen) {
        getDisplayMedia();
      } else {
        getUserMedia();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ---------- Signaling ----------
  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    const conn = connections.current[fromId];
    if (!conn) return;

    if (signal.sdp) {
      conn.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            conn.createAnswer()
              .then((description) => conn.setLocalDescription(description))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: conn.localDescription })
                );
              })
              .catch((e) => console.log(e));
          }
        })
        .catch((e) => console.log(e));
    }

    if (signal.ice) {
      conn.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
    }
  };

  const addMessage = (data, senderName, socketIdSender) => {
    setMessages((prev) => [...prev, { data, senderName }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const connectToSocketServer = () => {
    setConnectionStatus("Connecting");
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      setConnectionStatus("Live");
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
        if (connections.current[id]) {
          connections.current[id].close();
          delete connections.current[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (connections.current[socketListId]) return;

          connections.current[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections.current[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections.current[socketListId].ontrack = (event) => {
            setVideos((prev) => {
              const exists = prev.find((v) => v.socketId === socketListId);
              if (exists) {
                return prev.map((v) =>
                  v.socketId === socketListId ? { ...v, stream: event.streams[0] } : v
                );
              }
              return [
                ...prev,
                { socketId: socketListId, stream: event.streams[0] },
              ];
            });
          };

          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
              connections.current[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (const id2 in connections.current) {
            if (id2 === socketIdRef.current) continue;

            if (window.localStream) {
              window.localStream.getTracks().forEach((track) => {
                try {
                  connections.current[id2].addTrack(track, window.localStream);
                } catch (e) {}
              });
            }

            connections.current[id2].createOffer()
              .then((description) => connections.current[id2].setLocalDescription(description))
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections.current[id2].localDescription })
                );
              })
              .catch((e) => console.log(e));
          }
        }
      });
    });

    socketRef.current.on("disconnect", () => setConnectionStatus("Disconnected"));
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);
    getMedia();
  };

  // ---------- Chat ----------
  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setShowChat((prev) => !prev);
    if (!showChat) setNewMessages(0);
  };

  const endCall = () => {
    try {
      window.localStream?.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    Object.values(connections.current).forEach((conn) => conn.close());
    connections.current = {};
    socketRef.current?.disconnect();
    window.location.href = "/home";
  };

  const initials = username.trim().slice(0, 1).toUpperCase() || "?";

  // ---------- Render ----------
  if (askForUsername) {
    return (
      <div style={styles.page}>
        <div style={styles.bgGlowOrange} />
        <div style={styles.bgGlowBlue} />

        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.brandIcon}>🎥</div>
            <span style={styles.brandName}>XYZ Video Call</span>
          </div>
        </header>

        <div style={styles.lobbyWrapper}>
          <div style={styles.lobbyCard}>
            <div style={styles.lobbyKicker}>
              <span style={styles.kickerDot} />
              FACE TO FACE, FROM ANYWHERE
            </div>
            <h2 style={styles.lobbyTitle}>Ready to join?</h2>
            <p style={styles.lobbySubtitle}>
              Check how you look and sound, then hop into the room.
            </p>

            <div style={styles.previewFrame}>
              <div style={styles.previewDots}>
                <span style={styles.dot} />
                <span style={styles.dot} />
                <span style={styles.dot} />
                <span style={styles.previewTime}>{clock}</span>
              </div>
              <div style={styles.previewBox}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={styles.previewVideo}
                />
                {!videoAvailable && (
                  <div style={styles.previewOverlay}>Camera not available</div>
                )}
                <span style={styles.tilePill}>You</span>
              </div>
            </div>

            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              style={styles.input}
              required
            />

            <button type="button" onClick={connect} style={styles.primaryButton}>
              Join Meeting →
            </button>

            <div style={styles.lobbyFootnote}>
              <span style={styles.statusDotGreen} />
              {videoAvailable ? "Camera ready" : "No camera detected"} ·{" "}
              {audioAvailable ? "Mic ready" : "No mic detected"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowOrange} />
      <div style={styles.bgGlowBlue} />

      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🎥</div>
          <span style={styles.brandName}>XYZ Video Call</span>
        </div>
        <div style={styles.statusPill}>
          <span
            style={{
              ...styles.statusDotGreen,
              background: connectionStatus === "Live" ? "#4ade80" : "#f4a26f",
            }}
          />
          {connectionStatus === "Live" ? "Live · Stable connection" : connectionStatus}
        </div>
      </header>

      <div style={styles.meetingWrapper}>
        <div style={styles.videoGrid}>
          <div style={{ ...styles.videoTile, ...styles.localTile }}>
            <video ref={localVideoRef} autoPlay muted playsInline style={styles.tileVideo} />
            <span style={styles.tilePill}>You</span>
          </div>

          {videos.map((v) => (
            <RemoteVideoTile key={v.socketId} stream={v.stream} socketId={v.socketId} />
          ))}

          {videos.length === 0 && (
            <div style={styles.waitingTile}>
              <div style={styles.waitingAvatar}>{initials}</div>
              <span style={styles.waitingText}>Waiting for others to join…</span>
            </div>
          )}
        </div>

        {showChat && (
          <div style={styles.chatPanel}>
            <div style={styles.chatHeader}>
              <span>Chat</span>
              <button style={styles.chatCloseBtn} onClick={toggleChat}>✕</button>
            </div>
            <div style={styles.chatMessages}>
              {messages.length === 0 && (
                <div style={styles.chatEmpty}>No messages yet — say hi 👋</div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={styles.chatMessage}>
                  <strong style={styles.chatSender}>{m.senderName}</strong>
                  <div>{m.data}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputRow}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Type a message..."
                style={styles.chatInput}
              />
              <button onClick={sendMessage} style={styles.chatSendBtn}>Send</button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.controlBar}>
        <button
          onClick={() => setVideo((v) => !v)}
          style={video ? styles.controlBtn : styles.controlBtnOff}
          disabled={!videoAvailable}
          title="Toggle camera"
        >
          {video ? "📷" : "🚫"}
        </button>

        <button
          onClick={() => setAudio((a) => !a)}
          style={audio ? styles.controlBtn : styles.controlBtnOff}
          disabled={!audioAvailable}
          title="Toggle mic"
        >
          {audio ? "🎤" : "🔇"}
        </button>

        {screenAvailable && (
          <button
            onClick={() => setScreen((s) => !s)}
            style={screen ? styles.controlBtnActive : styles.controlBtn}
            title="Share screen"
          >
            🖥️
          </button>
        )}

        <button onClick={toggleChat} style={styles.controlBtn} title="Chat">
          💬
          {newMessages > 0 && <span style={styles.badge}>{newMessages}</span>}
        </button>

        <button onClick={endCall} style={styles.endCallBtn} title="Leave call">
          End Call
        </button>
      </div>
    </div>
  );
}

function RemoteVideoTile({ stream, socketId }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div style={styles.videoTile}>
      <video ref={ref} autoPlay playsInline style={styles.tileVideo} />
      <span style={{ ...styles.tilePill, background: colorForId(socketId) }}>
        {socketId.slice(0, 4)}
      </span>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0d0f1a",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: "hidden",
  },
  bgGlowOrange: {
    position: "absolute",
    top: "-10%",
    right: "-10%",
    width: 500,
    height: 500,
    background: "radial-gradient(circle, rgba(255,138,91,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGlowBlue: {
    position: "absolute",
    bottom: "-15%",
    left: "-10%",
    width: 500,
    height: 500,
    background: "radial-gradient(circle, rgba(91,141,239,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    background: "rgba(28,32,42,0.6)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(8px)",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg, #ff8a5b, #f4a26f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  brandName: { color: "#fff", fontWeight: 700, fontSize: 16 },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#cfd3dc",
    fontSize: 13,
    fontWeight: 500,
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 8px #4ade80",
    display: "inline-block",
  },

  // ----- Lobby -----
  lobbyWrapper: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  lobbyCard: {
    background: "rgba(28,32,42,0.85)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: "32px",
    width: 380,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  lobbyKicker: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#ff8a5b",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#ff8a5b",
    display: "inline-block",
  },
  lobbyTitle: { color: "#fff", margin: 0, fontSize: 24, fontWeight: 700 },
  lobbySubtitle: { color: "#9aa0ac", margin: 0, fontSize: 14, lineHeight: 1.5 },
  previewFrame: {
    background: "#161922",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  previewDots: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.03)",
  },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#3a3f4b" },
  previewTime: { marginLeft: "auto", color: "#6b7280", fontSize: 12 },
  previewBox: {
    position: "relative",
    width: "100%",
    height: 200,
    background: "#0d0f13",
  },
  previewVideo: { width: "100%", height: "100%", objectFit: "cover" },
  previewOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9aa0ac",
    fontSize: 13,
  },
  input: {
    padding: "13px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#161922",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  primaryButton: {
    padding: "13px 16px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(244,115,79,0.35)",
  },
  lobbyFootnote: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#7a8190",
    fontSize: 12,
  },

  // ----- Meeting -----
  meetingWrapper: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "flex",
  },
  videoGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
    padding: 20,
    overflowY: "auto",
    alignContent: "start",
  },
  videoTile: {
    position: "relative",
    background: "#161922",
    borderRadius: 16,
    overflow: "hidden",
    aspectRatio: "16/9",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  localTile: {
    background: "linear-gradient(135deg, #ff8a5b, #f4a26f)",
  },
  tileVideo: { width: "100%", height: "100%", objectFit: "cover" },
  tilePill: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(0,0,0,0.45)",
    padding: "4px 10px",
    borderRadius: 20,
  },
  waitingTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.12)",
    aspectRatio: "16/9",
    color: "#7a8190",
  },
  waitingAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
  },
  waitingText: { fontSize: 13 },

  // ----- Controls -----
  controlBar: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: "18px",
    background: "rgba(28,32,42,0.7)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(8px)",
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    position: "relative",
  },
  controlBtnOff: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    background: "#e25c5c",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  controlBtnActive: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  endCallBtn: {
    padding: "0 22px",
    height: 48,
    borderRadius: 24,
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(244,115,79,0.35)",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    background: "#f4734f",
    color: "#fff",
    fontSize: 11,
    borderRadius: "50%",
    width: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // ----- Chat -----
  chatPanel: {
    width: 300,
    margin: "20px 20px 20px 0",
    background: "rgba(28,32,42,0.9)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    overflow: "hidden",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
  },
  chatCloseBtn: {
    background: "none",
    border: "none",
    color: "#9aa0ac",
    cursor: "pointer",
    fontSize: 14,
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 200,
  },
  chatEmpty: { color: "#6b7280", fontSize: 13, textAlign: "center", marginTop: 20 },
  chatMessage: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: "8px 12px",
    color: "#e5e7eb",
    fontSize: 13,
  },
  chatSender: { color: "#ff8a5b", fontSize: 12, display: "block", marginBottom: 2 },
  chatInputRow: {
    display: "flex",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  chatInput: {
    flex: 1,
    padding: "12px 14px",
    border: "none",
    background: "transparent",
    color: "#fff",
    outline: "none",
    fontSize: 13,
  },
  chatSendBtn: {
    padding: "0 18px",
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
};