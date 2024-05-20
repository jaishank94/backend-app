import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";
import { Category } from "../models/category.js";
import { Order } from "../models/order.js";

export const getRecommendations = asyncError(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("interests");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract user interests and trade type
    const userInterests = user.interests.map((interest) => interest);
    const userTradeType = user.tradeType;

    // Find products with matching category and trade type to user interests and trade type
    const products = await Product.find({
      category: { $in: userInterests },
      tradeType: { $ne: userTradeType },
      createdBy: { $ne: req.user._id },
    });

    // Get user's orders
    const userOrders = await Order.find({ user: req.user._id });

    // Map product IDs to an array
    const userProductIds = userOrders.flatMap((order) =>
      order.orderItems.map((item) => item.product.toString())
    );

    // Add a property to each product indicating whether the user has ordered it
    const recommendedProducts = products.map((product) => ({
      ...product.toObject(),
      orderedByUser: userProductIds.includes(product._id.toString()),
    }));

    res.status(200).json({
      success: true,
      recommendedProducts,
    });
  } catch (error) {
    console.error("Error recommending products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getAllProducts = asyncError(async (req, res, next) => {
  const { keyword, category } = req.query;
  const query = {
    name: {
      $regex: keyword ? keyword : "",
      $options: "i",
    },
  };
  if (category !== undefined) {
    query.category = category;
  }
  const products = await Product.find(query);
  res.status(200).json({
    success: true,
    products,
  });
});

export const getUserProducts = asyncError(async (req, res, next) => {
  const userId = req.user._id;
  const products = await Product.find({ createdBy: userId });

  const outOfStock = products.filter((i) => i.stock === 0);

  res.status(200).json({
    success: true,
    products,
    outOfStock: outOfStock.length,
    inStock: products.length - outOfStock.length,
  });
});

export const getProductDetails = asyncError(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId)
    .populate("category")
    .populate("createdBy");

  if (!product) return next(new ErrorHandler("Product not found", 404));

  // Check if the user has ordered this product
  const userOrders = await Order.find({ user: req?.user?._id });
  const userProductIds = userOrders.flatMap((order) =>
    order.orderItems.map((item) => item.product.toString())
  );
  const orderedByUser = userProductIds.includes(productId);

  // Add a property to the product indicating whether the user has ordered it
  const productDetails = {
    ...product.toObject(),
    orderedByUser,
  };

  console.log("productDetails", product, orderedByUser);

  res.status(200).json({
    success: true,
    product: productDetails,
  });
});

export const createProduct = asyncError(async (req, res, next) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    tradeType,
    minOrderQty,
    maxOrderQty,
  } = req.body;

  if (!req.file) return next(new ErrorHandler("Please add image", 400));

  const createdBy = req.user._id;

  // Check if createdBy user exists
  const user = await User.findById(createdBy);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await Product.create({
    name,
    description,
    category,
    price,
    stock,
    tradeType,
    minOrderQty,
    maxOrderQty,
    createdBy,
    images: [image],
  });

  res.status(200).json({
    success: true,
    message: "Product Created Successfully",
  });
});

export const updateProduct = asyncError(async (req, res, next) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    tradeType,
    minOrderQty,
    maxOrderQty,
  } = req.body;

  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (tradeType) product.tradeType = tradeType;
  if (minOrderQty) product.minOrderQty = minOrderQty;
  if (maxOrderQty) product.maxOrderQty = maxOrderQty;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const addProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  if (!req.file) return next(new ErrorHandler("Please add image", 400));

  const file = getDataUri(req.file);
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image Added Successfully",
  });
});

export const deleteProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  const id = req.query.id;

  if (!id) return next(new ErrorHandler("Please Image Id", 400));

  let isExist = -1;

  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });

  if (isExist < 0) return next(new ErrorHandler("Image doesn't exist", 400));

  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);

  product.images.splice(isExist, 1);

  await product.save();

  res.status(200).json({
    success: true,
    message: "Image Deleted Successfully",
  });
});

export const deleteProduct = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }
  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const addCategory = asyncError(async (req, res, next) => {
  await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "Category Added Successfully",
  });
});

export const getAllCategories = asyncError(async (req, res, next) => {
  const categories = await Category.find({});

  res.status(200).json({
    success: true,
    categories,
  });
});

export const deleteCategory = asyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category Not Found", 404));
  const products = await Product.find({ category: category._id });

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }

  await category.remove();

  res.status(200).json({
    success: true,
    message: "Category Deleted Successfully",
  });
});
