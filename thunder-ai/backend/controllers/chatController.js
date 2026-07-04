import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Memory from "../models/Memory.js";
import { askGroq } from "../services/groqService.js";
import { extractAndSaveMemories } from "../services/memoryExtractor.js";

export async function listConversations(req, res) {
  const conversations = await Conversation.find({ userId: req.userId }).sort({ updatedAt: -1 });
  res.json(conversations);
}

export async function getConversationMessages(req, res) {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ _id: conversationId, userId: req.userId });
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  res.json(messages);
}

export async function renameConversation(req, res) {
  const { conversationId } = req.params;
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title can't be empty." });
  }

  const conversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, userId: req.userId },
    { title: title.trim() },
    { new: true }
  );
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });
  res.json(conversation);
}

export async function deleteConversation(req, res) {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOneAndDelete({
    _id: conversationId,
    userId: req.userId,
  });
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });

  await Message.deleteMany({ conversationId });
  res.json({ deleted: true });
}

export async function sendMessage(req, res) {
  try {
    const { conversationId, message, attachment } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message can't be empty." });
    }

    let conversation = conversationId
      ? await Conversation.findOne({ _id: conversationId, userId: req.userId })
      : null;

    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.userId,
        title: message.slice(0, 40),
      });
    }

    // If a file was attached, fold its contents into what the model sees
    const fullMessage = attachment
      ? `${message}\n\nAttached file: ${attachment.name}\n\`\`\`\n${attachment.content}\n\`\`\``
      : message;

    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: fullMessage,
    });

    const history = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(20);

    const memories = await Memory.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(15);
    const memoryContext = memories.length
      ? `Things you remember about the user:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
      : "";

    const systemPrompt = `You are a helpful AI assistant. Reply in whatever language the user writes in.
${memoryContext}`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await askGroq(chatMessages);

    await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: reply,
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    extractAndSaveMemories({
      userId: req.userId,
      userMessage: message,
      conversationId: conversation._id,
    });

    res.json({ conversationId: conversation._id, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
}