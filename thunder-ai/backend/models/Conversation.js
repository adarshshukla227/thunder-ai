import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, default: "demo-user" },
    title: { type: String, default: "New chat" },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
