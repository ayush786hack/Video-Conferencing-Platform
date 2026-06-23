import React, { useState } from "react";
import {withAuth} from "../utils/withAuth.jsx";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";


function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
 const {addToUserHistory} =useContext(AuthContext);
  const handleJoinVideoCall = async() => {
    await addToUserHistory(meetingCode);
    if (!meetingCode.trim()) return;
    navigate(`/${meetingCode.trim()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoinVideoCall();
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowOrange} />
      <div style={styles.bgGlowBlue} />

      {/* ---------- Nav bar ---------- */}
      <header style={styles.navBar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>🎥</div>
          <span style={styles.brandName}>SYNCHORA Video Call</span>
        </div>

        <nav style={styles.navLinks}>
   
          <button style={styles.navOutlineBtn}
         onClick={() => navigate('/history')}
         >
            History
          </button>
          <button style={styles.navPrimaryBtn}
          onClick={()=>{
            localStorage.removeItem('token')
            navigate('/auth')
          }}>LogOut</button>
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <main style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.kicker}>
            <span style={styles.kickerDot} />
            FACE TO FACE, FROM ANYWHERE
          </div>

          <h1 style={styles.heroTitle}>
            Stay close to
            <br />
            the people you
            <br />
            <span style={styles.heroTitleAccent}>love most</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Crystal-clear video calls that make distance feel smaller.
            No downloads, no fuss — just open a link and you're in the
            room together.
          </p>

          <div style={styles.joinRow}>
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a meeting code"
              style={styles.joinInput}
            />
            <button
              type="button"
              onClick={handleJoinVideoCall}
              style={styles.joinButton}
            >
              Join call →
            </button>
          </div>

          <div style={styles.footnote}>
            <div style={styles.avatarStack}>
              <span style={{ ...styles.avatar, background: "#f4d4a6", zIndex: 3 }}>A</span>
              <span style={{ ...styles.avatar, background: "#ff8a5b", zIndex: 2 }}>R</span>
              <span style={{ ...styles.avatar, background: "#7c8bdb", zIndex: 1 }}>M</span>
            </div>
            <span style={styles.footnoteText}>Joined by 40,000+ families this year</span>
          </div>
        </div>

        {/* ---------- Preview card ---------- */}
        <div style={styles.heroRight}>
          <div style={styles.previewFrame}>
            <div style={styles.previewDots}>
              <span style={styles.dot} />
              <span style={styles.dot} />
              <span style={styles.dot} />
              <span style={styles.previewTime}>12:48</span>
            </div>

            <div style={styles.previewMain}>
              <span style={styles.previewMainPill}>Mom &amp; Dad</span>
            </div>

            <div style={styles.previewThumbRow}>
              <div style={styles.previewThumb}>
                <span style={styles.previewThumbPill}>You</span>
              </div>
              <div style={{ ...styles.previewThumb, background: "#1c2027" }}>
                <span style={styles.previewThumbPill}>Sam</span>
              </div>
            </div>

            <div style={styles.previewControls}>
              <span style={styles.previewControlBtn}>🎤</span>
              <span style={styles.previewControlBtn}>📷</span>
              <span style={styles.previewControlBtnEnd}>⏎</span>
            </div>
          </div>

          <div style={styles.statusPill}>
            <span style={styles.statusDotGreen} />
            Live · Stable connection
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: "#0d0f1a",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: "hidden",
  },
  bgGlowOrange: {
    position: "absolute",
    top: "-12%",
    right: "-8%",
    width: 520,
    height: 520,
    background: "radial-gradient(circle, rgba(255,138,91,0.16) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGlowBlue: {
    position: "absolute",
    bottom: "-18%",
    left: "-10%",
    width: 520,
    height: 520,
    background: "radial-gradient(circle, rgba(91,141,239,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },

  // ----- Nav -----
  navBar: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 48px",
    background: "rgba(28,32,42,0.55)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(8px)",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #ff8a5b, #f4a26f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
  },
  brandName: { color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: 0.2 },
  navLinks: { display: "flex", alignItems: "center", gap: 12 },
  navGhostBtn: {
    background: "none",
    border: "none",
    color: "#9aa0ac",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  navOutlineBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  navPrimaryBtn: {
    padding: "9px 18px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(244,115,79,0.3)",
  },

  // ----- Hero -----
  hero: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 64,
    maxWidth: 1180,
    margin: "0 auto",
    padding: "100px 48px 80px",
    flexWrap: "wrap",
  },
  heroLeft: {
    flex: "1 1 460px",
    maxWidth: 540,
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  kicker: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#ff8a5b",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.8,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#ff8a5b",
    display: "inline-block",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 52,
    lineHeight: 1.12,
    fontWeight: 700,
    margin: 0,
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  heroTitleAccent: { color: "#ff8a5b" },
  heroSubtitle: {
    color: "#9aa0ac",
    fontSize: 16,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 460,
  },
  joinRow: {
    display: "flex",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap",
  },
  joinInput: {
    flex: "1 1 240px",
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  joinButton: {
    padding: "14px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(244,115,79,0.35)",
    whiteSpace: "nowrap",
  },
  footnote: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  avatarStack: { display: "flex" },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "2px solid #0d0f1a",
    marginLeft: -8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#1c2027",
  },
  footnoteText: { color: "#7a8190", fontSize: 13 },

  // ----- Preview card -----
  heroRight: {
    flex: "1 1 360px",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    alignItems: "flex-end",
  },
  previewFrame: {
    width: "100%",
    background: "rgba(28,32,42,0.85)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
  },
  previewDots: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
  },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#3a3f4b" },
  previewTime: { marginLeft: "auto", color: "#6b7280", fontSize: 13 },
  previewMain: {
    position: "relative",
    height: 220,
    margin: "16px 16px 0",
    borderRadius: 14,
    background: "linear-gradient(135deg, #ffb088, #ff8a5b)",
  },
  previewMainPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
  },
  previewThumbRow: { display: "flex", gap: 10, padding: 16 },
  previewThumb: {
    position: "relative",
    flex: 1,
    height: 110,
    borderRadius: 12,
    background: "#2a2f6e",
  },
  previewThumbPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    background: "rgba(0,0,0,0.4)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 16,
  },
  previewControls: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    padding: "0 16px 18px",
  },
  previewControlBtn: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
  },
  previewControlBtnEnd: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 20,
    background: "rgba(28,32,42,0.85)",
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
};

export default withAuth(Home);