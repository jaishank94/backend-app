import express from "express";
import { getCompanyCharges } from "../controllers/companycharge.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/all", isAuthenticated, getCompanyCharges);

export default router;
