import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import "./authentication.css"
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
export default function Authentication() {
  const [mode, setMode] = useState("login"); // "login" | "register"
   const [username, setUsername] = useState("");


  const[messages,setMessages] = useState([]);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "", username: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };
  const handleClose = () => {
  setOpen(false);
};

  const [open, setOpen] = useState(false);

    const {handleLogin, handleRegister} = useContext(AuthContext);
   let handleAuth =async()=>{
    try{
      if(mode==="login"){
        let result =await handleLogin(loginData.username,loginData.password);
        setMessages([...messages, result]);
        setOpen(true);
      }
      if(mode==="register"){
        let result =await handleRegister(registerData.name,registerData.username,registerData.password);
        if (registerData.password !== registerData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
      
        setMessages([...messages, result]);
        setOpen(true);

      }
    }catch(error){
  console.error("Authentication error:", error);

  setMessages([
    {
      success: false,
      message: error.message,
    }
  ]);

  setOpen(true);
}
   }

  const switchMode = (next) => {
    setError("");
    setMode(next);
  };

  return (
    <div className="authPageContainer relative w-screen min-h-screen z-0 overflow-hidden">

      {/* Ambient signature element, quieter than on the landing page */}
      <div className="constellation" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <line className="link" x1="120" y1="620" x2="380" y2="480" />
          <line className="link" x1="380" y1="480" x2="700" y2="560" />
          <line className="link" x1="700" y1="560" x2="980" y2="420" />
          <line className="link" x1="980" y1="420" x2="1120" y2="220" />
          <line className="link" x1="380" y1="480" x2="250" y2="280" />
          <circle className="node coral" cx="120" cy="620" r="3" />
          <circle className="node" cx="380" cy="480" r="2.6" />
          <circle className="node" cx="700" cy="560" r="3" />
          <circle className="node coral" cx="980" cy="420" r="2.6" />
          <circle className="node" cx="1120" cy="220" r="2.8" />
          <circle className="node" cx="250" cy="280" r="2.4" />
        </svg>
      </div>

      <Link to="/" className="authBrand">
        <div className="brand-mark">🎥</div>
        <span className="brand-name">XYZ Video Call</span>
      </Link>

      <div className="authLayout">

        {/* Left: brand / pitch pane */}
        <div className="authPitch">
          <div className="eyebrow">Face to face, from anywhere</div>
          <h1 className="pitch-headline">
            One link is all<br />it takes to feel<br /><em>in the room</em>
          </h1>
          <p className="pitch-sub">
            Sign in to pick up where you left off, or create an account
            to start your first call in under a minute.
          </p>

          <div className="pitch-points">
            <div className="pitch-point">
              <span className="pitch-dot" />
              No app required — works in the browser
            </div>
            <div className="pitch-point">
              <span className="pitch-dot" />
              Calls stay private, end to end
            </div>
            <div className="pitch-point">
              <span className="pitch-dot" />
              Free for calls with friends and family
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="authCardWrap">
          <div className="authCard">

            <div className="authTabs" role="tablist" aria-label="Authentication mode">
              <button
                role="tab"
                aria-selected={mode === "login"}
                className={`authTab ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
              <button
                role="tab"
                aria-selected={mode === "register"}
                className={`authTab ${mode === "register" ? "active" : ""}`}
                onClick={() => switchMode("register")}
              >
                Sign up
              </button>
              <span className={`authTabIndicator ${mode === "register" ? "right" : ""}`} />
            </div>

            {error && <div className="authError" role="alert">{error}</div>}

            {mode === "login" ? (
              <form className="authForm">
                <h2 className="authFormTitle">Welcome back</h2>
                <p className="authFormSub">Log in to jump back into your calls.</p>

                <label className="authField">
                  <span>Username</span>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    required
                  />
                </label>

                <label className="authField">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </label>

                <div className="authFieldRow">
                  <label className="authCheckbox">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="authLink">Forgot password?</a>
                </div>

                <button type="submit" className="authSubmit" onClick={(e) => {
    e.preventDefault();
    handleAuth();
  }}>Log in</button>

                <button type="button" className="authGuest">
                  Continue as guest
                </button>

                <p className="authSwitchText">
                  New here?{" "}
                  <button type="button" className="authSwitchLink" onClick={() => switchMode("register")}>
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              <form className="authForm" >
                <h2 className="authFormTitle">Create your account</h2>
                <p className="authFormSub">Set up your account to start calling.</p>

                <label className="authField">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                  />
                </label>

                <label className="authField">
                  <span>Username</span>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </label>

                <label className="authField">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </label>

                <label className="authField">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                </label>

                <button type="submit" className="authSubmit"  onClick={(e) => {
    e.preventDefault();
    handleAuth();
  }}>
                  Create account
                </button>

                <p className="authSwitchText">
                  Already have an account?{" "}
                  <button type="button" className="authSwitchLink" onClick={() => switchMode("login")}>
                    Log in
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>

      </div>
    <Snackbar
  open={open}
  autoHideDuration={5000}
  onClose={handleClose}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
>
  <Alert
    onClose={handleClose}
    severity={
      messages[messages.length - 1]?.success ? "success" : "error"
    }
    variant="filled"
    sx={{ width: "100%" }}
  >
    {messages[messages.length - 1]?.message ||
      messages[messages.length - 1] ||
      "Operation completed"}
  </Alert>
</Snackbar>
    
    </div>
  );
}