import { asyncError } from "../middlewares/error.js";
import { Message } from "../models/message.js";

export const getMessages = asyncError(async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).send(err);
  }
});

export const sendMessages = asyncError(async (req, res) => {
  const userId = req.user._id;
  const { message } = req.body;

  const newMessage = new Message({
    userId,
    message,
  });
  try {
    await newMessage.save();
    io.emit('newMessage', newMessage);
    return res.status(201).send({ success: true });
  } catch (err) {
    return res.status(400).send(err);
  }
});
