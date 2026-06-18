import React from 'react'
import Lightfall from '../component/Lightfall';
import "./landing.css"
export default function Landing() {
  return (
    <div className="landingPageContainer relative w-screen h-screen z-0">
      <Lightfall />
<nav className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-[75%] max-w-6xl">

  <div  className="
    h-25 w-350 
  
    flex items-center justify-between
    rounded-3xl
    bg-white/10
    backdrop-blur-2xl
    border border-white/20
    shadow-2xl
  ">

    {/* Logo */}
    <div className="flex items-center gap-7">
      <div className="
        w-20 h-16
          rounded-xl
        bg-gradient-to-r
        from-violet-500
        to-indigo-500
        flex items-center justify-center
        shadow-lg
      ">
        🎥
      </div>

      <h1 className="text-2xl font-bold text-white tracking-wide">
        XYZ-Video-Call
      </h1>
    </div>

    {/* Nav Links */}
    <div className="flex items-center gap-4">

      <button className="
        text-white/80
        hover:text-white
        transition-all
        h-10 w-30
      ">
        Join as Guest
      </button>

      <button className="
        px-5 py-2
        h-10 w-30
        rounded-xl
        bg-white/10
        border border-white/20
        text-white
        hover:bg-white/20
        transition-all
      ">
        Login
      </button>

      <button className="
        px-5 py-2
        h-10 w-30
        rounded-xl
        bg-gradient-to-r
        from-violet-600
        to-indigo-600
        text-white
        font-semibold
        shadow-lg
        hover:scale-105
        transition-all
      ">
        Register
      </button>

    </div>

  </div>

</nav>

     
    </div>
  );
}

   

