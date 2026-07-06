export default function ChatHeader({ title, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        margin: "12px 0 0 20px",
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        borderRadius: 8,
        color: "var(--text-primary)",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {title || "New chat"}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}