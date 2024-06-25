import express from "express";
import { getMessages, sendMessages } from "../controllers/message.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Get messages
router.get('/', isAuthenticated, getMessages);
// Send a new message
router.post('/', isAuthenticated, sendMessages);

export default router;
