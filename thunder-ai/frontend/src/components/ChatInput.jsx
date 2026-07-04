import { useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function ChatInput({ onSend, disabled, voiceOutputOn, onToggleVoiceOutput }) {
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

  return (
    <div style={{ borderTop: "0.5px solid var(--border)", padding: "10px 24px 20px" }}>
      {attachment && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--panel-raised)",
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

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.txt,.md,.json,.css,.html,.java,.c,.cpp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach a file"
          style={iconButtonStyle}
        >
          +
        </button>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            background: "var(--panel-raised)",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            padding: "12px 14px",
            color: "var(--text-primary)",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
          }}
        />

        <button
          onClick={toggleMic}
          title={listening ? "Stop listening" : "Voice input"}
          style={{
            ...iconButtonStyle,
            borderColor: listening ? "var(--accent)" : "var(--border)",
            color: listening ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          {listening ? "●" : "🎙"}
        </button>

        <button
          onClick={onToggleVoiceOutput}
          title={voiceOutputOn ? "Voice replies on" : "Voice replies off"}
          style={{
            ...iconButtonStyle,
            borderColor: voiceOutputOn ? "var(--accent)" : "var(--border)",
            color: voiceOutputOn ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          🔊
        </button>

        <button
          onClick={handleSend}
          disabled={disabled}
          style={{
            padding: "0 18px",
            height: 42,
            background: "var(--accent)",
            border: "none",
            borderRadius: 10,
            color: "#1a1006",
            fontSize: 13,
            fontWeight: 600,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const iconButtonStyle = {
  width: 42,
  height: 42,
  flexShrink: 0,
  background: "var(--panel-raised)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  fontSize: 15,
  color: "var(--text-secondary)",
};
