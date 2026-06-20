import axios from "axios";
import {createContext} from "react";
import {useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext =createContext({});


const client =axios.create({
    baseURL:"localhost:8000/api/v1/users",

})

export const AuthProvider =({children})=>{
    const authContext =useContext(AuthContext);
    const [userData ,setUserData]=useState(AuthContext);
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
            console.error("Registration error:", error);
            throw new Error("Failed to register. Please try again.");
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
                return request.data.message;
            }
        }catch(error){
            console.error("Login error:", error);
            throw new Error("Failed to login. Please try again.");
        }
    }

 
    const data ={
        userData,
        setUserData,handleRegister,handleLogin
    }
    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}