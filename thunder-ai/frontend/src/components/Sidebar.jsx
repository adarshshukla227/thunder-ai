import { useState } from "react";

export default function Sidebar({
  items,
  activeItemId,
  onSelectItem,
  onNewItem,
  onRenameItem,
  onDeleteItem,
  onOpenChatsList,
  onOpenMemory,
  user,
  onLogout,
  mode,
  onSwitchMode,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  function handleSelect(id) {
    setMenuOpenId(null);
    onSelectItem(id);
  }

  function startRename(item) {
    setMenuOpenId(null);
    setRenamingId(item._id);
    setRenameValue(item.title);
  }

  function submitRename(id) {
    if (renameValue.trim()) onRenameItem(id, renameValue.trim());
    setRenamingId(null);
  }

  function handleDelete(id) {
    setMenuOpenId(null);
    onDeleteItem(id);
  }

  const visibleItems = query
    ? items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
    : items;

  if (collapsed) {
    return (
      <aside
        style={{
          width: 60,
          background: "var(--panel)",
          borderRight: "0.5px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          padding: "16px 0",
          gap: 14,
        }}
      >
        <button onClick={() => setCollapsed(false)} title="Expand sidebar" style={headerIconButtonStyle}>
          <PanelIcon />
        </button>
        <button onClick={() => setCollapsed(false)} title="Search chats" style={headerIconButtonStyle}>
          <SearchIcon />
        </button>
        <button onClick={onNewItem} title="New chat" style={collapsedIconStyle}>
          ＋
        </button>
        <button
          onClick={() => onSwitchMode("chat")}
          title="Chat mode"
          style={{ ...collapsedIconStyle, color: mode === "chat" ? "var(--accent)" : "var(--text-secondary)" }}
        >
          💬
        </button>
        <button
          onClick={() => onSwitchMode("code")}
          title="Coding mode"
          style={{ ...collapsedIconStyle, color: mode === "code" ? "var(--accent)" : "var(--text-secondary)" }}
        >
          {"</>"}
        </button>
        <button onClick={onOpenMemory} title="What the AI knows about you" style={collapsedIconStyle}>
          🧠
        </button>
        <div style={{ flex: 1 }} />
        <div
          title={user?.name || "Account"}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "0.5px solid var(--accent)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {user?.name ? user.name[0].toUpperCase() : "?"}
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: 260,
        background: "var(--panel)",
        borderRight: "0.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 16px 12px",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 15 }}>
          thunder-ai<span className="blink-cursor">_</span>
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setSearchOpen((v) => !v)}
            title="Search"
            style={{
              ...headerIconButtonStyle,
              borderColor: searchOpen ? "var(--accent)" : "var(--border)",
              color: searchOpen ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <SearchIcon />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={headerIconButtonStyle}
          >
            <PanelIcon />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div style={{ padding: "0 12px 10px" }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "chat" ? "Search chats..." : "Search code chats..."}
            style={{
              width: "100%",
              padding: "8px 10px",
              background: "var(--panel-raised)",
              border: "0.5px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: 12,
            }}
          />
        </div>
      )}

      {/* Mode switch */}
      <div style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}>
        <button
          onClick={() => onSwitchMode("chat")}
          title="Chat mode"
          style={{
            flex: 1,
            padding: "8px 0",
            background: mode === "chat" ? "var(--accent-dim)" : "transparent",
            border: mode === "chat" ? "1px solid var(--accent)" : "0.5px solid var(--border)",
            borderRadius: 8,
            color: mode === "chat" ? "var(--accent)" : "var(--text-muted)",
            fontSize: 12,
          }}
        >
          Chat
        </button>
        <button
          onClick={() => onSwitchMode("code")}
          title="Coding mode"
          style={{
            flex: 1,
            padding: "8px 0",
            background: mode === "code" ? "var(--accent-dim)" : "transparent",
            border: mode === "code" ? "1px solid var(--accent)" : "0.5px solid var(--border)",
            borderRadius: 8,
            color: mode === "code" ? "var(--accent)" : "var(--text-muted)",
            fontSize: 12,
          }}
        >
          Code
        </button>
      </div>

      <div style={{ padding: "0 12px 10px" }}>
        <button onClick={onNewItem} style={navButtonStyle(true)}>
          <PlusIcon /> {mode === "chat" ? "New chat" : "New code chat"}
        </button>
      </div>

      <nav style={{ padding: "0 12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        <button
          onClick={onOpenChatsList}
          style={navButtonStyle(true)}
          title={mode === "chat" ? "See all chats" : "See all code chats"}
        >
          <ChatsIcon /> {mode === "chat" ? "Chats" : "Code chats"}
        </button>
        <button disabled style={navButtonStyle(false)} title="Coming soon">
          <span>📁</span> Projects
          <span style={soonBadgeStyle}>Soon</span>
        </button>
        <button disabled style={navButtonStyle(false)} title="Coming soon">
          <span>🧩</span> Artifacts
          <span style={soonBadgeStyle}>Soon</span>
        </button>
        <button disabled style={navButtonStyle(false)} title="Coming soon">
          <span>⚙️</span> Customize
          <span style={soonBadgeStyle}>Soon</span>
        </button>
      </nav>

      <button
        onClick={onOpenMemory}
        style={{ ...navButtonStyle(false), margin: "0 12px 10px", color: "var(--text-secondary)" }}
      >
        <span>🧠</span> What the AI knows about you
      </button>

      <p
        style={{
          margin: "6px 16px 4px",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: "var(--text-muted)",
        }}
      >
        Recents
      </p>

      <div style={{ overflowY: "auto", padding: "0 8px", flex: 1 }}>
        {visibleItems.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 12, padding: "8px 10px" }}>
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
                  margin: "4px 6px",
                  padding: "6px 8px",
                  background: "var(--panel-raised)",
                  border: "0.5px solid var(--accent)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontSize: 13,
                }}
              />
            ) : (
              <>
                <div
                  onClick={() => handleSelect(item._id)}
                  style={{
                    flex: 1,
                    padding: "9px 6px 9px 10px",
                    fontSize: 13,
                    color:
                      activeItemId === item._id ? "var(--text-primary)" : "var(--text-secondary)",
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
                    fontSize: 14,
                    padding: "6px 8px",
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
                  top: 34,
                  zIndex: 5,
                  background: "var(--panel-raised)",
                  border: "0.5px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  minWidth: 110,
                }}
              >
                <button onClick={() => startRename(item)} style={menuItemStyle}>
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{ ...menuItemStyle, color: "var(--danger)" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "0.5px solid var(--accent)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {user?.name ? user.name[0].toUpperCase() : "?"}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.name || "Account"}
          </p>
        </div>
        <button
          onClick={onLogout}
          title="Log out"
          style={{
            background: "transparent",
            border: "0.5px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-muted)",
            fontSize: 11,
            padding: "5px 8px",
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}

function navButtonStyle(enabled) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "8px 10px",
    background: "transparent",
    border: "none",
    borderRadius: 8,
    color: enabled ? "var(--text-primary)" : "var(--text-muted)",
    fontSize: 13,
    textAlign: "left",
  };
}

const soonBadgeStyle = {
  marginLeft: "auto",
  fontSize: 10,
  padding: "2px 6px",
  borderRadius: 20,
  background: "var(--accent-dim)",
  color: "var(--accent)",
};

const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "8px 12px",
  background: "transparent",
  border: "none",
  color: "var(--text-primary)",
  fontSize: 12,
  textAlign: "left",
};

const collapsedIconStyle = {
  width: 36,
  height: 36,
  background: "transparent",
  border: "none",
  borderRadius: 8,
  color: "var(--text-secondary)",
  fontSize: 15,
};

const headerIconButtonStyle = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "0.5px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-secondary)",
};

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="10" r="6" />
      <circle cx="15" cy="14" r="6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PanelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <line x1="9" y1="4" x2="9" y2="20" />
    </svg>
  );
}