import express from "express";
import {
  listMemories,
  deleteMemory,
  clearAllMemories,
} from "../controllers/memoryController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listMemories);
router.delete("/:id", deleteMemory);
router.delete("/", clearAllMemories);

export default router;
