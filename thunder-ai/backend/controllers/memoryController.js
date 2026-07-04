import Memory from "../models/Memory.js";

export async function listMemories(req, res) {
  const memories = await Memory.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(memories);
}

export async function deleteMemory(req, res) {
  const { id } = req.params;
  await Memory.findOneAndDelete({ _id: id, userId: req.userId });
  res.json({ deleted: true });
}

export async function clearAllMemories(req, res) {
  await Memory.deleteMany({ userId: req.userId });
  res.json({ cleared: true });
}
