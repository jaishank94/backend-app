import express from "express";
import { getAllCategories } from "../controllers/category.js";

const router = express.Router();

router.post("/all", getAllCategories);

export default router;
