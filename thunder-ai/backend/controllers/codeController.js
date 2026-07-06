import { askGroq } from "../services/groqService.js";
import CodeSession from "../models/CodeSession.js";

const DEBUG_SYSTEM_PROMPT = `You are an expert software engineer acting as a debugging agent.
The user will give you a file's code, optionally with an error message.

Find and fix every bug you can see. Then respond in exactly this format:

\`\`\`
<the complete corrected file, nothing removed or truncated>
\`\`\`
SUMMARY: <one or two sentences describing what you fixed>

Rules:
- Always return the FULL file, never a partial snippet.
- Keep the exact same programming language as the original code — never translate,
  rewrite, or convert it into a different language, even if the filename or its
  extension suggests a different language. Detect the language from the code itself.
- If you find no bugs, return the code unchanged and say so in the summary.`;

export async function debugCode(req, res) {
  try {
    const { code, error, filename } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: "No code was provided." });
    }

    const userPrompt = `Filename: ${filename || "untitled"}
${error ? `\nError message:\n${error}\n` : ""}
Code:
\`\`\`
${code}
\`\`\``;

    const raw = await askGroq(
      [
        { role: "system", content: DEBUG_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.2 }
    );

    const codeMatch = raw.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
    const summaryMatch = raw.match(/SUMMARY:\s*([\s\S]*)/);

    const fixedCode = codeMatch ? codeMatch[1].trim() : raw.trim();
    const summary = summaryMatch ? summaryMatch[1].trim() : "Review the changes below.";

    res.json({ fixedCode, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Debugging failed. Try again." });
  }
}

export async function listCodeSessions(req, res) {
  const sessions = await CodeSession.find({ userId: req.userId })
    .select("title filename updatedAt")
    .sort({ updatedAt: -1 });
  res.json(sessions);
}

export async function getCodeSession(req, res) {
  const session = await CodeSession.findOne({ _id: req.params.sessionId, userId: req.userId });
  if (!session) return res.status(404).json({ error: "Code chat not found." });
  res.json(session);
}

export async function saveCodeSession(req, res) {
  const { sessionId, filename, code, errorMsg, fixedCode, summary } = req.body;
  const title = filename?.trim() || "Untitled code chat";

  let session;
  if (sessionId) {
    session = await CodeSession.findOneAndUpdate(
      { _id: sessionId, userId: req.userId },
      { title, filename, code, errorMsg, fixedCode, summary },
      { new: true }
    );
  }
  if (!session) {
    session = await CodeSession.create({
      userId: req.userId,
      title,
      filename,
      code,
      errorMsg,
      fixedCode,
      summary,
    });
  }
  res.json(session);
}

export async function renameCodeSession(req, res) {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title can't be empty." });
  }
  const session = await CodeSession.findOneAndUpdate(
    { _id: req.params.sessionId, userId: req.userId },
    { title: title.trim() },
    { new: true }
  );
  if (!session) return res.status(404).json({ error: "Code chat not found." });
  res.json(session);
}

export async function deleteCodeSession(req, res) {
  const session = await CodeSession.findOneAndDelete({
    _id: req.params.sessionId,
    userId: req.userId,
  });
  if (!session) return res.status(404).json({ error: "Code chat not found." });
  res.json({ deleted: true });
}