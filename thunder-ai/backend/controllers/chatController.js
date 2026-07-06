import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Memory from "../models/Memory.js";
import { askGroq } from "../services/groqService.js";
import { extractAndSaveMemories } from "../services/memoryExtractor.js";

async function generateTitle(userMessage, assistantReply) {
  try {
    const raw = await askGroq(
      [
        {
          role: "system",
          content:
            "Generate a short 3-6 word title that summarizes what this conversation is about. Reply with only the title itself — no quotes, no punctuation at the end, no preamble.",
        },
        {
          role: "user",
          content: `User: ${userMessage}\nAssistant: ${assistantReply.slice(0, 300)}`,
        },
      ],
      { temperature: 0.3 }
    );
    return raw.trim().replace(/^["']|["']$/g, "").slice(0, 60) || userMessage.slice(0, 40);
  } catch {
    return userMessage.slice(0, 40);
  }
}

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

    const isNewConversation = !conversation;

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

    if (isNewConversation) {
      conversation.title = await generateTitle(message, reply);
    }
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

export async function regenerateReply(req, res) {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ _id: conversationId, userId: req.userId });
    if (!conversation) return res.status(404).json({ error: "Conversation not found." });

    const allMessages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    if (allMessages.length === 0) {
      return res.status(400).json({ error: "Nothing to regenerate yet." });
    }

    const last = allMessages[allMessages.length - 1];
    if (last.role !== "assistant") {
      return res.status(400).json({ error: "Send a message before regenerating." });
    }

    const historyForLLM = allMessages.slice(0, -1);
    const memories = await Memory.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(15);
    const memoryContext = memories.length
      ? `Things you remember about the user:\n${memories.map((m) => `- ${m.content}`).join("\n")}`
      : "";
    const systemPrompt = `You are a helpful AI assistant. Reply in whatever language the user writes in.
${memoryContext}`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...historyForLLM.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await askGroq(chatMessages);
    last.content = reply;
    await last.save();

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't regenerate. Try again." });
  }
}