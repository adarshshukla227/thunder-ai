import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import MemoryDashboard from "../components/MemoryDashboard";
import ChatsListModal from "../components/ChatsListModal";
import CodeWorkspace from "../components/CodeWorkspace";
import {
  sendMessage,
  regenerateReply,
  fetchMessages,
  fetchMe,
  fetchConversations,
  renameConversation,
  deleteConversation,
  fetchCodeSessions,
  fetchCodeSession,
  renameCodeSession,
  deleteCodeSession,
} from "../api/client";

export default function ChatPage({ onLogout }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("chat");

  // Chat mode state
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  // Code mode state
  const [codeSessions, setCodeSessions] = useState([]);
  const [codeSessionId, setCodeSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const [showMemory, setShowMemory] = useState(false);
  const [showChatsList, setShowChatsList] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => onLogout());
  }, []);

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, [conversationId]);

  useEffect(() => {
    fetchCodeSessions().then(setCodeSessions);
  }, [codeSessionId]);

  // ---- Chat mode handlers ----
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

  async function handleRegenerate() {
    if (!conversationId || isThinking || messages.length === 0) return;
    setIsThinking(true);
    try {
      const { reply } = await regenerateReply(conversationId);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: reply };
        return updated;
      });
    } catch (err) {
      // leave the existing reply as-is if regeneration fails
    } finally {
      setIsThinking(false);
    }
  }

  async function handleRenameConversation(id, title) {
    await renameConversation(id, title);
    setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, title } : c)));
  }

  async function handleDeleteConversation(id) {
    await deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (conversationId === id) handleNewChat();
  }

  // ---- Code mode handlers ----
  async function handleSelectCodeSession(id) {
    const session = await fetchCodeSession(id);
    setCodeSessionId(id);
    setActiveSession(session);
  }

  function handleNewCodeSession() {
    setCodeSessionId(null);
    setActiveSession(null);
  }

  function handleSessionSaved(saved) {
    setCodeSessionId(saved._id);
    setActiveSession(saved);
  }

  async function handleRenameCodeSession(id, title) {
    await renameCodeSession(id, title);
    setCodeSessions((prev) => prev.map((s) => (s._id === id ? { ...s, title } : s)));
  }

  async function handleDeleteCodeSession(id) {
    await deleteCodeSession(id);
    setCodeSessions((prev) => prev.filter((s) => s._id !== id));
    if (codeSessionId === id) handleNewCodeSession();
  }

  const currentTitle = conversations.find((c) => c._id === conversationId)?.title;

  const sidebarProps = {
    user,
    onLogout,
    mode,
    onSwitchMode: setMode,
    onOpenMemory: () => setShowMemory(true),
    onOpenChatsList: () => setShowChatsList(true),
    ...(mode === "chat"
      ? {
          items: conversations,
          activeItemId: conversationId,
          onSelectItem: handleSelectConversation,
          onNewItem: handleNewChat,
          onRenameItem: handleRenameConversation,
          onDeleteItem: handleDeleteConversation,
        }
      : {
          items: codeSessions,
          activeItemId: codeSessionId,
          onSelectItem: handleSelectCodeSession,
          onNewItem: handleNewCodeSession,
          onRenameItem: handleRenameCodeSession,
          onDeleteItem: handleDeleteCodeSession,
        }),
  };

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <div style={{ height: "100%", width: "100%", perspective: 2000 }}>
        <div
          className="flip-scene-inner"
          style={{ transform: mode === "code" ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="flip-face" style={{ pointerEvents: mode === "chat" ? "auto" : "none" }}>
            <Sidebar {...sidebarProps} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
              <ChatHeader title={currentTitle} onClick={() => setShowChatsList(true)} />
              <ChatWindow
                messages={messages}
                isThinking={isThinking}
                onRegenerate={handleRegenerate}
              />
              <ChatInput
                onSend={handleSend}
                disabled={isThinking}
              />
            </div>
          </div>

          <div
            className="flip-face flip-face-back"
            style={{ pointerEvents: mode === "code" ? "auto" : "none" }}
          >
            <Sidebar {...sidebarProps} />
            <CodeWorkspace
              session={activeSession}
              sessionId={codeSessionId}
              onSessionSaved={handleSessionSaved}
            />
          </div>
        </div>
      </div>

      {showMemory && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <MemoryDashboard onClose={() => setShowMemory(false)} />
        </div>
      )}

      {showChatsList && (
        <ChatsListModal
          items={sidebarProps.items}
          activeItemId={sidebarProps.activeItemId}
          onSelectItem={sidebarProps.onSelectItem}
          onRenameItem={sidebarProps.onRenameItem}
          onDeleteItem={sidebarProps.onDeleteItem}
          onClose={() => setShowChatsList(false)}
          mode={mode}
        />
      )}
    </div>
  );
}