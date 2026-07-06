import express from "express";
import {
  listConversations,
  getConversationMessages,
  renameConversation,
  deleteConversation,
  sendMessage,
  regenerateReply,
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listConversations);
router.get("/:conversationId", getConversationMessages);
router.patch("/:conversationId", renameConversation);
router.delete("/:conversationId", deleteConversation);
router.post("/:conversationId/regenerate", regenerateReply);
router.post("/", sendMessage);

export default router;