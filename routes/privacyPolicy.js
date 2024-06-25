import express from "express";
import { createPrivacyPolicy, deletePrivacyPolicy, getPrivacyPolicy, updatePrivacyPolicy } from "../controllers/privacyPolicy.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get('/', isAuthenticated, getPrivacyPolicy);
router.post('/', isAuthenticated, createPrivacyPolicy);
router.put('/:id', isAuthenticated, updatePrivacyPolicy);
router.delete('/:id', isAuthenticated, deletePrivacyPolicy);

export default router;