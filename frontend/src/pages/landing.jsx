import React from 'react'
import { Link } from 'react-router-dom';
// import Lightfall from '../component/Lightfall';
import "./landing.css"
import {useNavigate} from "react-router-dom";
export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landingPageContainer relative w-screen min-h-screen z-0 overflow-hidden">
     

      {/* Ambient signature element: distant points linking together */}
      <div className="constellation" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <line className="link" x1="120" y1="620" x2="380" y2="480" />
          <line className="link" x1="380" y1="480" x2="700" y2="560" />
          <line className="link" x1="700" y1="560" x2="980" y2="420" />
          <line className="link" x1="980" y1="420" x2="1120" y2="220" />
          <line className="link" x1="380" y1="480" x2="250" y2="280" />
          <line className="link" x1="700" y1="560" x2="640" y2="760" />
          <line className="link" x1="120" y1="620" x2="60" y2="380" />
          <circle className="node coral" cx="120" cy="620" r="3" />
          <circle className="node" cx="380" cy="480" r="2.6" />
          <circle className="node" cx="700" cy="560" r="3" />
          <circle className="node coral" cx="980" cy="420" r="2.6" />
          <circle className="node" cx="1120" cy="220" r="2.8" />
          <circle className="node" cx="250" cy="280" r="2.4" />
          <circle className="node" cx="640" cy="760" r="2.4" />
          <circle className="node" cx="60" cy="380" r="2.2" />
        </svg>
      </div>

      <nav className="topnav absolute top-8 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-6xl">
        <div className="navbar flex items-center justify-between">

          {/* Logo */}
          <div className="brand flex items-center gap-4">
            <div className="brand-mark flex items-center justify-center">
              🎥
            </div>
            <h1 className="brand-name">
              SYNCHORA Video Call
            </h1>
          </div>

          {/* Nav Links */}
          <div className="nav-links flex items-center gap-2">
            <button className="btn-ghost" onClick={() => navigate("/dsjkfsnfj")}>
              Join as guest
            </button>

            <button className="btn-outline" onClick={() => navigate("/auth")}>
              Log in
            </button>

            <button className="btn-solid" onClick={() => navigate("/auth")}>
              Sign up
            </button>
          </div>

        </div>
      </nav>

      <section className="hero relative z-10">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">Face to face, from anywhere</div>
            <h1 className="headline">
              Stay close to<br />
              the people you<br />
              <em>love most</em>
            </h1>
            <p className="subhead">
              Crystal-clear video calls that make distance feel smaller.
              No downloads, no fuss — just open a link and you're in the
              room together.
            </p>

            <div className="hero-ctas">
              <Link to="/auth" className="cta-primary">
                Get started free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a href="#how-it-works" className="cta-secondary">See how it works</a>
            </div>

            <div className="trust-row">
              <div className="avatars">
                <span style={{ background: '#FFDAB9' }}>A</span>
                <span style={{ background: '#FF8966' }}>R</span>
                <span style={{ background: '#A8A4C9' }}>M</span>
              </div>
              <span>Joined by 40,000+ families this year</span>
            </div>
          </div>

          <div>
            <div className="call-mock">
              <div className="call-mock-bar">
                <div className="call-dots"><span></span><span></span><span></span></div>
                <div className="call-timer">12:48</div>
              </div>
              <div className="call-grid">
                <div className="call-tile tile-1"><span className="name">Mom &amp; Dad</span></div>
                <div className="call-tile tile-2"><span className="name">You</span></div>
                <div className="call-tile tile-3"><span className="name">Sam</span></div>
              </div>
              <div className="call-controls">
                <button aria-label="Toggle microphone">🎙️</button>
                <button aria-label="Toggle camera">📷</button>
                <button className="end" aria-label="End call">⏎</button>
              </div>
              <div className="float-card">
                <span className="pulse-dot"></span>
                <span>Live · Stable connection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}