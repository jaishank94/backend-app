import express from "express";
import { getAllCategories } from "../controllers/category.js";

const router = express.Router();

router.get("/all", getAllCategories);

export default router;
