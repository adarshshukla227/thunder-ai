import express from "express";
import { debugCode } from "../controllers/codeController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.post("/debug", debugCode);

export default router;