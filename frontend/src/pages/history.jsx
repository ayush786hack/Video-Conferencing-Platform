import React, { useContext, useEffect, useState } from "react";
import { withAuth } from "../utils/withAuth.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function formatWhen(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Unknown date";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`;

  return `${date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} · ${time}`;
}

function getMeetingCode(meeting) {
  return meeting.meetingCode || meeting.code || meeting.roomId || "—";
}

function getMeetingDate(meeting) {
  return meeting.date || meeting.createdAt || meeting.joinedAt || null;
}

function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const history = await getHistoryOfUser();
        setMeetings(history.meetings || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Couldn't load your meeting history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleRejoin = (meeting) => {
    const code = getMeetingCode(meeting);
    if (code && code !== "—") navigate(`/${code}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlowOrange} />
      <div style={styles.bgGlowBlue} />

      {/* ---------- Nav bar ---------- */}
      <header style={styles.navBar}>
        <div style={styles.brand} onClick={() => navigate("/home")} role="button">
          <div style={styles.brandIcon}>🎥</div>
          <span style={styles.brandName}>SYNCHORA Video Call</span>
        </div>

        <button style={styles.navOutlineBtn} onClick={() => navigate("/home")}>
          ← Back to home
        </button>
      </header>

      {/* ---------- Content ---------- */}
      <main style={styles.content}>
        <div style={styles.kicker}>
          <span style={styles.kickerDot} />
          YOUR ACTIVITY
        </div>
        <h1 style={styles.title}>Meeting history</h1>
        <p style={styles.subtitle}>
          Every call you've joined, in one place. Rejoin any of them with a single tap.
        </p>

        <div style={styles.card}>
          {loading && (
            <div style={styles.stateBlock}>
              <div style={styles.spinner} />
              <span style={styles.stateText}>Loading your meetings…</span>
            </div>
          )}

          {!loading && error && (
            <div style={styles.stateBlock}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.stateText}>{error}</span>
            </div>
          )}

          {!loading && !error && meetings.length === 0 && (
            <div style={styles.stateBlock}>
              <span style={styles.emptyIcon}>🗒️</span>
              <span style={styles.stateText}>No meetings yet.</span>
              <span style={styles.stateSubtext}>
                Join a call and it'll show up here.
              </span>
            </div>
          )}

          {!loading && !error && meetings.length > 0 && (
            <ul style={styles.list}>
              {meetings.map((meeting, idx) => (
                <li key={meeting._id || meeting.id || idx} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <span style={styles.codeBadge}>{getMeetingCode(meeting)}</span>
                    <span style={styles.whenText}>{formatWhen(getMeetingDate(meeting))}</span>
                  </div>
                  <button style={styles.rejoinBtn} onClick={() => handleRejoin(meeting)}>
                    Rejoin →
                  </button>
                </li>
              ))}
            </ul>
          )}
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
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
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

  // ----- Content -----
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: 720,
    margin: "0 auto",
    padding: "64px 24px 80px",
  },
  kicker: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#ff8a5b",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#ff8a5b",
    display: "inline-block",
  },
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: 700,
    margin: "0 0 10px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  subtitle: {
    color: "#9aa0ac",
    fontSize: 15,
    lineHeight: 1.6,
    margin: "0 0 32px",
    maxWidth: 480,
  },

  card: {
    background: "rgba(28,32,42,0.75)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },

  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
  },
  listItemLeft: { display: "flex", alignItems: "center", gap: 12 },
  codeBadge: {
    background: "rgba(255,138,91,0.15)",
    color: "#ff8a5b",
    fontSize: 14,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 8,
    fontFamily: "monospace",
  },
  whenText: { color: "#7a8190", fontSize: 13 },
  rejoinBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #ff8a5b, #f4734f)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(244,115,79,0.3)",
  },

  // ----- States: loading / error / empty -----
  stateBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "56px 20px",
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#ff8a5b",
    animation: "history-spin 0.8s linear infinite",
  },
  stateText: { color: "#cfd3dc", fontSize: 14, fontWeight: 500 },
  stateSubtext: { color: "#6b7280", fontSize: 13 },
  errorIcon: { fontSize: 24 },
  emptyIcon: { fontSize: 28 },
};

// Keyframes for the spinner (inline style objects can't define @keyframes,
// so it's injected once into the document head).
if (typeof document !== "undefined" && !document.getElementById("history-spin-keyframes")) {
  const styleTag = document.createElement("style");
  styleTag.id = "history-spin-keyframes";
  styleTag.innerHTML = `@keyframes history-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleTag);
}

export default withAuth(History);