import express from "express";
import { createTermsAndConditions, deleteTermsAndConditions, getTermsAndConditions, updateTermsAndConditions } from "../controllers/t&c.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get('/', isAuthenticated, getTermsAndConditions);
router.post('/', isAuthenticated, createTermsAndConditions);
router.put('/:id', isAuthenticated, updateTermsAndConditions);
router.delete('/:id', isAuthenticated, deleteTermsAndConditions);

export default router;