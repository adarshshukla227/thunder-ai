import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import MemoryDashboard from "../components/MemoryDashboard";
import CodeWorkspace from "../components/CodeWorkspace";
import { sendMessage, fetchMessages, fetchMe } from "../api/client";

export default function ChatPage({ onLogout }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("chat");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [voiceOutputOn, setVoiceOutputOn] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => onLogout());
  }, []);

  async function handleSelectConversation(id) {
    setConversationId(id);
    const msgs = await fetchMessages(id);
    setMessages(msgs);
  }

  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
  }

  async function handleSend(text, attachment) {
    const userMsg = { tempId: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const { conversationId: newId, reply } = await sendMessage(conversationId, text, attachment);
      setConversationId(newId);
      setMessages((prev) => [
        ...prev,
        { tempId: Date.now() + 1, role: "assistant", content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { tempId: Date.now() + 1, role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  const sidebarProps = {
    activeConversationId: conversationId,
    onSelectConversation: handleSelectConversation,
    onNewChat: handleNewChat,
    onOpenMemory: () => setShowMemory(true),
    user,
    onLogout,
    mode,
    onSwitchMode: setMode,
  };

  return (
    <div style={{ height: "100vh", width: "100vw", perspective: 2000 }}>
      <div
        className="flip-scene-inner"
        style={{ transform: mode === "code" ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="flip-face" style={{ pointerEvents: mode === "chat" ? "auto" : "none" }}>
          <Sidebar {...sidebarProps} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
            <ChatWindow messages={messages} isThinking={isThinking} voiceOutputOn={voiceOutputOn} />
            <ChatInput
              onSend={handleSend}
              disabled={isThinking}
              voiceOutputOn={voiceOutputOn}
              onToggleVoiceOutput={() => setVoiceOutputOn((v) => !v)}
            />
            {showMemory && <MemoryDashboard onClose={() => setShowMemory(false)} />}
          </div>
        </div>

        <div
          className="flip-face flip-face-back"
          style={{ pointerEvents: mode === "code" ? "auto" : "none" }}
        >
          <Sidebar {...sidebarProps} />
          <CodeWorkspace />
        </div>
      </div>
    </div>
  );
}