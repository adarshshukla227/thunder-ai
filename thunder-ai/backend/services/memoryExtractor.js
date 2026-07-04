import { askGroq } from "./groqService.js";
import Memory from "../models/Memory.js";

const EXTRACTOR_PROMPT = `You are a memory extractor. From the user's message, pull out only the
facts that would be useful in future conversations (things like: name, profession, preferences,
project details, tech stack, goals). Ignore small talk or one-off questions.

Return only a JSON array, nothing else. Each item should be a short, clear sentence.
If no new fact was found, return an empty array: []

Example output: ["User is learning Node.js", "User is a beginner developer"]`;

export async function extractAndSaveMemories({ userId, userMessage, conversationId }) {
  try {
    const raw = await askGroq(
      [
        { role: "system", content: EXTRACTOR_PROMPT },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.2 }
    );

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const facts = JSON.parse(match[0]);
    if (!Array.isArray(facts) || facts.length === 0) return [];

    const saved = await Memory.insertMany(
      facts.map((content) => ({ userId, content, sourceConversationId: conversationId }))
    );
    return saved;
  } catch (err) {
    // Memory extraction failing should never break the chat itself
    console.error("Memory extraction skipped:", err.message);
    return [];
  }
}
