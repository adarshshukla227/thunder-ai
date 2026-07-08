import { useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  function handleSend() {
    if ((!value.trim() && !attachment) || disabled) return;
    onSend(value || `Check this file: ${attachment?.name}`, attachment);
    setValue("");
    setAttachment(null);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, content: reader.result });
    reader.readAsText(file);
    e.target.value = "";
  }

  function toggleMic() {
    if (!SpeechRecognitionAPI) {
      alert("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  const hasContent = value.trim().length > 0 || !!attachment;

  return (
    <div style={{ padding: "10px 24px 20px" }}>
      <div
        style={{
          background: "var(--panel-raised)",
          border: "0.5px solid var(--border)",
          borderRadius: 20,
          padding: "12px 14px 10px",
        }}
      >
        {attachment && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--panel)",
              border: "0.5px solid var(--border)",
              borderRadius: 8,
              padding: "5px 10px",
              marginBottom: 8,
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            📎 {attachment.name}
            <button
              onClick={() => setAttachment(null)}
              aria-label="Remove attachment"
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13 }}
            >
              ×
            </button>
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={2}
          style={{
            width: "100%",
            resize: "none",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            padding: "2px 2px 8px",
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.txt,.md,.json,.css,.html,.java,.c,.cpp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach a file"
            style={roundIconStyle()}
          >
            <PlusIcon />
          </button>

          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button
              onClick={toggleMic}
              title={listening ? "Stop listening" : "Voice input"}
              style={roundIconStyle(listening)}
            >
              <MicIcon />
            </button>
            <button
              onClick={handleSend}
              disabled={disabled || !hasContent}
              title="Send"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "none",
                background: hasContent ? "var(--accent)" : "var(--border)",
                color: hasContent ? "#1a1006" : "var(--text-muted)",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundIconStyle(active) {
  return {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    borderRadius: "50%",
    color: active ? "var(--accent)" : "var(--text-secondary)",
  };
}

function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="6 11 12 5 18 11" />
    </svg>
  );
}