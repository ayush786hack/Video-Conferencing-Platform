import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import {Meeting}from "../models/meeting.model.js"

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    let isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res
        .status(httpStatus.OK)
        .json({ message: "Login successful", token: token });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error logging in" });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error registering user" });
  }
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const meetings = await Meeting.find({
      _id: { $in: user.history },
    });

    return res.status(200).json({ meetings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving user history" });
  }
};
const addToHistory = async (req, res) => {
  const { token, meetingCode } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meetingCode,
    });
    await newMeeting.save();
    user.history.push(newMeeting._id); 
    await user.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Meeting added to history successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error adding meeting to history" });
  }
};

export { login, register, getUserHistory, addToHistory };
