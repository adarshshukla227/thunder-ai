import { useState } from "react";

export default function ChatsListModal({
  items,
  activeItemId,
  onSelectItem,
  onRenameItem,
  onDeleteItem,
  onClose,
  mode,
}) {
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const visibleItems = query
    ? items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
    : items;

  function startRename(item) {
    setMenuOpenId(null);
    setRenamingId(item._id);
    setRenameValue(item.title);
  }

  function submitRename(id) {
    if (renameValue.trim()) onRenameItem(id, renameValue.trim());
    setRenamingId(null);
  }

  function handleSelect(id) {
    onSelectItem(id);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: 560,
          maxHeight: "78%",
          background: "var(--panel)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "0.5px solid var(--border)",
          }}
        >
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
            {mode === "chat" ? "All chats" : "All code chats"}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: 18 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "12px 20px" }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "chat" ? "Search chats..." : "Search code chats..."}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "var(--panel-raised)",
              border: "0.5px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ overflowY: "auto", padding: "0 12px 12px", flex: 1 }}>
          {visibleItems.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "10px 8px" }}>
              {mode === "chat"
                ? "No chats yet. Send a message to start one."
                : "No code chats yet. Debug some code to save one."}
            </p>
          )}
          {visibleItems.map((item) => (
            <div
              key={item._id}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                borderRadius: 8,
                background: activeItemId === item._id ? "var(--panel-raised)" : "transparent",
              }}
            >
              {renamingId === item._id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => submitRename(item._id)}
                  onKeyDown={(e) => e.key === "Enter" && submitRename(item._id)}
                  style={{
                    flex: 1,
                    margin: "5px 6px",
                    padding: "8px 10px",
                    background: "var(--panel-raised)",
                    border: "0.5px solid var(--accent)",
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                />
              ) : (
                <>
                  <div
                    onClick={() => handleSelect(item._id)}
                    style={{
                      flex: 1,
                      padding: "12px 10px",
                      fontSize: 14,
                      color: activeItemId === item._id ? "var(--text-primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </div>
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === item._id ? null : item._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: 15,
                      padding: "6px 10px",
                    }}
                  >
                    ⋮
                  </button>
                </>
              )}

              {menuOpenId === item._id && (
                <div
                  style={{
                    position: "absolute",
                    right: 6,
                    top: 40,
                    zIndex: 5,
                    background: "var(--panel-raised)",
                    border: "0.5px solid var(--border)",
                    borderRadius: 8,
                    overflow: "hidden",
                    minWidth: 110,
                  }}
                >
                  <button
                    onClick={() => startRename(item)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      textAlign: "left",
                    }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpenId(null);
                      onDeleteItem(item._id);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--danger)",
                      fontSize: 12,
                      textAlign: "left",
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}