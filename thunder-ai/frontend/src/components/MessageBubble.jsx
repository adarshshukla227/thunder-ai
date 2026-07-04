export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "6px 0",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "10px 14px",
          borderRadius: 12,
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          background: isUser ? "var(--accent-dim)" : "var(--panel-raised)",
          border: isUser ? "0.5px solid var(--accent)" : "0.5px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        {content}
      </div>
    </div>
  );
}
