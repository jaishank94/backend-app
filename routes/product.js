import express from "express";
import {
  addCategory,
  addProductImage,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  getAllCategories,
  getAllProducts,
  getProductDetails,
  updateProduct,
  getRecommendations,
  getUserProducts,
} from "../controllers/product.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllProducts);

// this is moved to /admin/product (admin.js)
router.get("/user", isAuthenticated, getUserProducts);

router.get("/recommendations", isAuthenticated, getRecommendations);

// ideally should be moved under admin
router.post("/", isAuthenticated, singleUpload, createProduct);

router.post("/category", isAuthenticated, addCategory);

router.get("/category", getAllCategories);


router
.route("/images/:productId")
.post(isAuthenticated, singleUpload, addProductImage)
.delete(isAuthenticated, deleteProductImage);

router.delete("/category/:id", isAuthenticated, deleteCategory);

router
  .route("/:productId")
  .get(isAuthenticated, getProductDetails)
  .put(isAuthenticated, updateProduct)
  .delete(isAuthenticated, deleteProduct);






export default router;
