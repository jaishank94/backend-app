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

router.get("/", isAuthenticated, getAllProducts);

// this is moved to /admin/product (admin.js)
// router.get("/admin", isAuthenticated, getAdminProducts);

router
  .route("/:productId")
  .get(isAuthenticated, getProductDetails)
  .put(isAuthenticated, updateProduct)
  .delete(isAuthenticated, deleteProduct);

// ideally should be moved under admin
router.post("/", isAuthenticated, singleUpload, createProduct);

router
  .route("/images/:productId")
  .post(isAuthenticated, singleUpload, addProductImage)
  .delete(isAuthenticated, deleteProductImage);

router.post("/category", isAuthenticated, addCategory);

router.get("/category", getAllCategories);

router.delete("/category/:id", isAuthenticated, deleteCategory);

router.get("/recommendations", isAuthenticated, getRecommendations);

export default router;
