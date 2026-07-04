import { useState } from "react";
import { debugCode } from "../api/client";
import { diffLines } from "../utils/diffLines";

export default function CodeWorkspace() {
  const [filename, setFilename] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDebugging, setIsDebugging] = useState(false);
  const [result, setResult] = useState(null); // { fixedCode, summary }
  const [showDiff, setShowDiff] = useState(true);

  async function handleDebug() {
    if (!code.trim()) return;
    setIsDebugging(true);
    setResult(null);
    try {
      const data = await debugCode(code, errorMsg, filename);
      setResult(data);
    } catch (err) {
      setResult({ fixedCode: code, summary: err.message });
    } finally {
      setIsDebugging(false);
    }
  }

  function acceptFix() {
    if (!result) return;
    setCode(result.fixedCode);
    setResult(null);
  }

  const diff = result ? diffLines(code, result.fixedCode) : [];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="filename (optional, e.g. main.py)"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
          }}
        />
        <button
          onClick={handleDebug}
          disabled={isDebugging || !code.trim()}
          style={{
            padding: "7px 16px",
            background: "var(--accent)",
            border: "none",
            borderRadius: 8,
            color: "#1a1006",
            fontSize: 12,
            fontWeight: 600,
            opacity: isDebugging || !code.trim() ? 0.6 : 1,
          }}
        >
          {isDebugging ? "Debugging…" : "Debug this code"}
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            spellCheck={false}
            style={{
              flex: 1,
              resize: "none",
              background: "var(--bg)",
              border: "none",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.6,
              padding: "16px 20px",
            }}
          />
          <input
            value={errorMsg}
            onChange={(e) => setErrorMsg(e.target.value)}
            placeholder="Paste the error message here (optional)"
            style={{
              margin: "0 20px 16px",
              padding: "9px 12px",
              background: "var(--panel-raised)",
              border: "0.5px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>

        <div
          style={{
            width: 320,
            borderLeft: "0.5px solid var(--border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              margin: 0,
              padding: "12px 16px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: "var(--text-muted)",
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            Debug agent
          </p>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {!result && !isDebugging && (
              <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
                Paste your code on the left, optionally add the error you're seeing, then
                hit "Debug this code". The agent reads the whole file and sends back a
                fully corrected version with a summary of what changed.
              </p>
            )}
            {isDebugging && (
              <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                Reading the file and looking for the bug…
              </p>
            )}
            {result && (
              <>
                <div
                  style={{
                    background: "var(--panel-raised)",
                    border: "0.5px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 12,
                    lineHeight: 1.6,
                    marginBottom: 12,
                  }}
                >
                  {result.summary}
                </div>

                <button
                  onClick={() => setShowDiff((v) => !v)}
                  style={{
                    width: "100%",
                    padding: "7px 0",
                    background: "transparent",
                    border: "0.5px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text-secondary)",
                    fontSize: 12,
                    marginBottom: 10,
                  }}
                >
                  {showDiff ? "Hide diff" : "Show diff"}
                </button>

                {showDiff && (
                  <div
                    style={{
                      background: "var(--bg)",
                      border: "0.5px solid var(--border)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      lineHeight: 1.7,
                      marginBottom: 12,
                      maxHeight: 320,
                      overflowY: "auto",
                    }}
                  >
                    {diff.map((d, idx) => (
                      <div
                        key={idx}
                        style={{
                          whiteSpace: "pre-wrap",
                          color:
                            d.type === "added"
                              ? "#7ee787"
                              : d.type === "removed"
                              ? "#ff8a8a"
                              : "var(--text-secondary)",
                          background:
                            d.type === "added"
                              ? "rgba(126,231,135,0.08)"
                              : d.type === "removed"
                              ? "rgba(255,138,138,0.08)"
                              : "transparent",
                        }}
                      >
                        {d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  "}
                        {d.line}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={acceptFix}
                  style={{
                    width: "100%",
                    padding: "9px 0",
                    background: "var(--accent)",
                    border: "none",
                    borderRadius: 8,
                    color: "#1a1006",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Accept fix
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}