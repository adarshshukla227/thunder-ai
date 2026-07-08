import { useState } from "react";

export default function MessageBubble({ role, content, isLast, onRegenerate }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleReadAloud() {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  return (
    <div style={{ padding: "6px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
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

      {!isUser && (
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <ActionButton title={copied ? "Copied" : "Copy"} onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </ActionButton>
          <ActionButton title={isSpeaking ? "Mute" : "Read aloud"} onClick={handleReadAloud} active={isSpeaking}>
            {isSpeaking ? <MuteIcon /> : <SpeakerIcon />}
          </ActionButton>
          {isLast && (
            <ActionButton title="Retry" onClick={onRegenerate}>
              <ReloadIcon />
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({ title, onClick, children, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "var(--accent-dim)" : "transparent",
        border: "none",
        borderRadius: 6,
        color: active ? "var(--accent)" : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}