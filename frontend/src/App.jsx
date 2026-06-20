import { useState } from 'react'

import Landing from './pages/landing.jsx';
import Authentication from './pages/authentication.jsx';
import { Routes,Route} from "react-router-dom";
function App() {
  const [count, setCount] = useState(0)

  return (
 
     <>
        
     
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Authentication />} />
        </Routes>
    
     </>

  )
}

export default App
