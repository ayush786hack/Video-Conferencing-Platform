import { useState } from 'react'

import Landing from './pages/landing.jsx';
import Authentication from './pages/authentication.jsx';
import VideoMeet from './pages/videoMeet.jsx';
import Home from './pages/home.jsx';
import History from './pages/history.jsx';
import { Routes,Route} from "react-router-dom";
function App() {
  const [count, setCount] = useState(0)

  return (
 
     <>
        
     
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Authentication />} />
           <Route path="/home" element={<Home />} />
           <Route path="/history" element={<History />} />
          <Route path="/:url" element={<VideoMeet />} />
        </Routes>
    
     </>

  )
}

export default App
