import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({limit:'40kb', extended: true }));
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1/users", userRoutes);


const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    server.listen(app.get("port"), () => {
      console.log(`Server is running on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
