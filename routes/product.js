import express from "express";
import {
  addCategory,
  addProductImage,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getProductDetails,
  updateProduct,
  getRecommendations,
} from "../controllers/product.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/all", getAllProducts);
router.get("/admin", isAuthenticated, getAdminProducts);

router
  .route("/single/:id")
  .get(isAuthenticated, getProductDetails)
  .put(isAuthenticated, updateProduct)
  .delete(isAuthenticated, deleteProduct);

router.post("/new", isAuthenticated, singleUpload, createProduct);

router
  .route("/images/:id")
  .post(isAuthenticated, singleUpload, addProductImage)
  .delete(isAuthenticated, deleteProductImage);

router.post("/category", isAuthenticated, addCategory);

router.get("/categories", getAllCategories);

router.delete("/category/:id", isAuthenticated, deleteCategory);

router.get("/recommendations", isAuthenticated, getRecommendations);

export default router;
