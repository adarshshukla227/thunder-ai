import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, isThinking, onRegenerate }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Start a conversation.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      {messages.map((m, idx) => (
        <MessageBubble
          key={m._id || m.tempId}
          role={m.role}
          content={m.content}
          isLast={idx === messages.length - 1}
          onRegenerate={onRegenerate}
        />
      ))}
      {isThinking && (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "6px 0" }}>
          Thinking…
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}