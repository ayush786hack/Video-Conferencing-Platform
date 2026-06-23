import axios from "axios";
import {createContext} from "react";
import {useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";
import httpStatus from "http-status";

export const AuthContext =createContext({});


const client =axios.create({
    baseURL:`${server}/api/v1/users`,

})

export const AuthProvider =({children})=>{
    const authContext =useContext(AuthContext);//this is wrong
    const [userData ,setUserData]=useState(AuthContext);//it should be null
       const router =useNavigate();
    const handleRegister=async(name,username,password)=>{
        try{
            let request =await client.post("/register",{
                name:name,
                username:username,
                password:password
            })
            if(request.status ===httpStatus.CREATED){
                return request.data.message;
            }
        }catch(error){
   throw new Error(
      error.response?.data?.message ||
      "Registration failed"
   );
}
    }
     
    const handleLogin=async(username,password)=>{
        try{
            let request =await client.post("/login",{
                username:username,
                password:password
            })
            if(request.status ===httpStatus.OK){
                localStorage.setItem("token",request.data.token);
                router("/home");
                return request.data.message;
            }
        }catch(error){
            console.error("Login error:", error);
             throw new Error(
      error.response?.data?.message ||
   
      "Login failed"
   );
        }
    }
   const getHistoryOfUser =async ()=>{
    try{
       let request = await client.get("/get_all_activities",{
        params:{
            token:localStorage.getItem("token")
        }
       });
          return request.data;
    }catch(error){
      throw error;
    }
   }
 
   const addToUserHistory=async(meetingCode)=>{
    try{
         let request = await client.post("/add_to_activity",{
        meetingCode:meetingCode,
        token:localStorage.getItem("token")
       })
          return request.data;
    }catch(error){
      throw error;
    }
   }
    const data ={
        userData,
        setUserData,handleRegister,handleLogin,getHistoryOfUser,addToUserHistory
    }
    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}