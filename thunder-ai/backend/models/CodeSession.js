import mongoose from "mongoose";

const codeSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, default: "Untitled code chat" },
    filename: { type: String, default: "" },
    code: { type: String, default: "" },
    errorMsg: { type: String, default: "" },
    fixedCode: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CodeSession", codeSessionSchema);