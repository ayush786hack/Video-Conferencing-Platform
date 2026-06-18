import { useState } from 'react'

import Landing from './pages/landing.jsx';
import { Routes,Route} from "react-router-dom";
function App() {
  const [count, setCount] = useState(0)

  return (
 
     <>
   
     
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
    
     </>

  )
}

export default App
