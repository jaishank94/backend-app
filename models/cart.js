import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
}, { _id: false } );

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [productSchema], // Array of products with quantity
  totalCartValue: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.pre('save', function(next) {
  let total = 0;
  console.log(Object.keys(this))
  this.products.forEach(product => {
    total += product.price * product.quantity;
  });
  this.totalCartValue = total;
  next();
});


export const Cart = mongoose.model("Cart", schema);
