import { app } from "./app.js";
import { connectDB } from "./data/database.js";
import cloudinary from "cloudinary";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { Server } from 'socket.io';
import http from 'http';
import { Message } from "./models/message.js";
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  Message.find().sort({ timestamp: 1 }).limit(100).exec((err, messages) => {
    if (err) throw err;
    socket.emit('initialMessages', messages);
  });
 
  socket.on('sendMessage', (data) => {
    const newMessage = new Message({
      userId: data.userId,
      message: data.message,
    });

    newMessage.save((err) => {
      if (err) throw err;
      io.emit('newMessage', newMessage);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

connectDB();

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server listening on port: ${process.env.PORT}, in ${process.env.NODE_ENV} MODE.`
  );
});
