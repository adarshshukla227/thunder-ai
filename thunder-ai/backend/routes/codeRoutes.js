import express from "express";
import {
  debugCode,
  listCodeSessions,
  getCodeSession,
  saveCodeSession,
  renameCodeSession,
  deleteCodeSession,
} from "../controllers/codeController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.post("/debug", debugCode);
router.get("/", listCodeSessions);
router.get("/:sessionId", getCodeSession);
router.post("/", saveCodeSession);
router.patch("/:sessionId", renameCodeSession);
router.delete("/:sessionId", deleteCodeSession);

export default router;