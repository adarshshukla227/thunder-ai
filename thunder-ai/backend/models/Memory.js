import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, default: "demo-user" },
    content: { type: String, required: true },
    sourceConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Memory", memorySchema);
