import { useEffect, useState } from "react";
import { fetchMemories, deleteMemory, clearAllMemories } from "../api/client";

export default function MemoryDashboard({ onClose }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories()
      .then(setMemories)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    setMemories((prev) => prev.filter((m) => m._id !== id));
    await deleteMemory(id);
  }

  async function handleClearAll() {
    setMemories([]);
    await clearAllMemories();
  }

  return (
    <div
      style={{
        minHeight: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        inset: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 480,
          maxHeight: "80%",
          background: "var(--panel)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "0.5px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              What the AI knows about you
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Every fact below, fully visible. Delete anything you don't want remembered.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px", flex: 1 }}>
          {loading && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
          )}
          {!loading && memories.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Nothing stored yet. As you chat, anything worth remembering shows up here.
            </p>
          )}
          {memories.map((m) => (
            <div
              key={m._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                marginBottom: 8,
                background: "var(--panel-raised)",
                border: "0.5px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)" }}>
                  {m.content}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
                  Learned {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(m._id)}
                aria-label="Delete this memory"
                style={{
                  background: "transparent",
                  border: "0.5px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--danger)",
                  fontSize: 11,
                  padding: "4px 8px",
                  flexShrink: 0,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {memories.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--border)" }}>
            <button
              onClick={handleClearAll}
              style={{
                width: "100%",
                padding: "9px 0",
                background: "transparent",
                border: "0.5px solid var(--danger)",
                borderRadius: 8,
                color: "var(--danger)",
                fontSize: 13,
              }}
            >
              Clear all memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
