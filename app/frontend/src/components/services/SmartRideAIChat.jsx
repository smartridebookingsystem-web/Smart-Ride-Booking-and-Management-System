import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * SmartRideAIChat — Standalone AI chatbot component.
 *
 * SECURITY:
 *   - JWT is read from Redux auth state (not from the request body).
 *   - userId is NEVER sent in the JSON body — the backend extracts it from the JWT.
 *   - Gemini API key is NEVER touched here — it lives only in the backend.
 *   - Anonymous users (no JWT) can use the chatbot without any login.
 *
 * Props: none (self-contained)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8088";
const AI_CHAT_URL = `${API_BASE_URL}/api/ai/chat`;

// Quick-question suggestions shown to the user initially
const SUGGESTIONS = [
  "How can I book a ride?",
  "How is fare calculated?",
  "What vehicle types are available?",
  "How do I contact support?",
  "What if I lose an item?",
];

// Helper to format message text (parses **bold** into bold elements, stripping raw asterisks)
const formatMessageText = (text) => {
  if (!text) return null;
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineFormatted = parts.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={partIdx} style={{ fontWeight: 600, color: "#0f172a" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {lineFormatted}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export default function SmartRideAIChat() {
  // Redux auth token — optional. If null, user is anonymous.
  const token = useSelector((state) => state.auth?.token || null);
  const isAuthenticated = !!token;

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! 👋 I'm SmartRide AI Assistant, powered by Google Gemini.\n\nI can help you with ride booking, fare estimation, driver support, complaints, lost & found, and more!\n\nHow can I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const appendMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const sendMessage = async (messageText) => {
    const msg = (messageText || inputText).trim();
    if (!msg || isLoading) return;

    setInputText("");
    setError(null);
    appendMessage("user", msg);
    setIsLoading(true);

    try {
      // Build headers — JWT is optional. If present, send it; otherwise omit.
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Request failed (${res.status})`);
      }

      const data = await res.json();
      appendMessage("ai", data.response || "I didn't get a response. Please try again.");
    } catch (err) {
      const fallback =
        err.message && !err.message.includes("fetch")
          ? err.message
          : "Sorry, SmartRide AI is temporarily unavailable. Please try again later.";
      appendMessage("ai", fallback);
      setError(null); // shown inline in the chat bubble, not as a separate banner
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  // ─────────────────────────────────────────────────────
  //  Inline Styles — preserves SmartRide theme
  // ─────────────────────────────────────────────────────
  const styles = {
    card: {
      borderRadius: "20px",
      overflow: "hidden",
      border: "none",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    },
    header: {
      background: "linear-gradient(135deg, #FF6B00, #FF8C42)",
      color: "#fff",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backdropFilter: "blur(4px)",
    },
    statusDot: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: "#4ade80",
      display: "inline-block",
      marginRight: 6,
      boxShadow: "0 0 6px #4ade80",
      animation: "pulse 2s infinite",
    },
    chatBody: {
      background: "#F8FAFC",
      height: 360,
      overflowY: "auto",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    bubbleAi: {
      background: "#fff",
      border: "1px solid #FFE4CC",
      borderRadius: "18px 18px 18px 4px",
      padding: "12px 16px",
      maxWidth: "80%",
      alignSelf: "flex-start",
      boxShadow: "0 2px 8px rgba(255,107,0,0.08)",
      fontSize: 14,
      lineHeight: 1.6,
      color: "#1e293b",
      whiteSpace: "pre-wrap",
    },
    bubbleUser: {
      background: "linear-gradient(135deg, #FF6B00, #FF8C42)",
      color: "#fff",
      borderRadius: "18px 18px 4px 18px",
      padding: "12px 16px",
      maxWidth: "80%",
      alignSelf: "flex-end",
      fontSize: 14,
      lineHeight: 1.6,
      whiteSpace: "pre-wrap",
    },
    timeStamp: {
      fontSize: 11,
      opacity: 0.6,
      marginTop: 4,
    },
    loadingBubble: {
      background: "#fff",
      border: "1px solid #FFE4CC",
      borderRadius: "18px 18px 18px 4px",
      padding: "12px 18px",
      maxWidth: 120,
      alignSelf: "flex-start",
    },
    footer: {
      background: "#fff",
      borderTop: "1px solid #f1f5f9",
      padding: "12px 16px",
    },
    inputGroup: {
      display: "flex",
      gap: 8,
      alignItems: "flex-end",
    },
    input: {
      flex: 1,
      border: "2px solid #FFE4CC",
      borderRadius: 12,
      padding: "10px 14px",
      outline: "none",
      fontSize: 14,
      resize: "none",
      fontFamily: "inherit",
      background: "#fff",
      color: "#1e293b",
      transition: "border-color 0.2s",
    },
    sendBtn: {
      background: isLoading ? "#94a3b8" : "linear-gradient(135deg, #FF6B00, #FF8C42)",
      border: "none",
      borderRadius: 12,
      color: "#fff",
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: isLoading ? "not-allowed" : "pointer",
      flexShrink: 0,
      fontSize: 16,
      transition: "background 0.2s, transform 0.1s",
    },
    suggestions: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      padding: "8px 16px 0",
    },
    suggestionChip: {
      background: "#FFF4E8",
      border: "1px solid #FFD9B3",
      borderRadius: 20,
      padding: "4px 12px",
      fontSize: 12,
      color: "#FF6B00",
      cursor: "pointer",
      fontWeight: 500,
      whiteSpace: "nowrap",
      transition: "background 0.15s",
    },
    poweredBy: {
      textAlign: "center",
      padding: "6px 0 2px",
      fontSize: 11,
      color: "#94a3b8",
    },
  };

  // Show suggestions only when there's just the initial AI greeting
  const showSuggestions = messages.length === 1 && !isLoading;

  return (
    <div style={styles.card}>
      {/* ─── Chat Header ─── */}
      <div style={styles.header}>
        <div style={styles.avatarCircle}>
          <i className="bi bi-robot" style={{ fontSize: 26, color: "#fff" }}></i>
        </div>
        <div style={{ flex: 1 }}>
          <h5 style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 16 }}>
            SmartRide AI Assistant
          </h5>
          <small style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>
            <span style={styles.statusDot}></span>
            {isAuthenticated ? "Connected • Personalized mode" : "Connected • Ask me anything"}
          </small>
        </div>
        <div style={{ textAlign: "right" }}>
          <small style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
            <i className="bi bi-shield-check me-1"></i>
            {isAuthenticated ? "Logged in" : "Guest"}
          </small>
        </div>
      </div>

      {/* ─── Chat Messages ─── */}
      <div style={styles.chatBody}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {msg.sender === "ai" ? (
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 2 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#FFF4E8",
                      border: "1px solid #FFD9B3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i className="bi bi-robot" style={{ fontSize: 14, color: "#FF6B00" }}></i>
                  </div>
                  <div style={styles.bubbleAi}>{formatMessageText(msg.text)}</div>
                </div>
                <div style={{ ...styles.timeStamp, marginLeft: 36, color: "#94a3b8" }}>
                  {msg.time}
                </div>
              </div>
            ) : (
              <div style={{ alignSelf: "flex-end" }}>
                <div style={styles.bubbleUser}>{msg.text}</div>
                <div style={{ ...styles.timeStamp, textAlign: "right", color: "#94a3b8" }}>
                  {msg.time}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={styles.loadingBubble}>
            <div className="d-flex align-items-center gap-2">
              <div
                className="spinner-border spinner-border-sm"
                style={{ color: "#FF6B00", width: 16, height: 16 }}
                role="status"
              ></div>
              <small style={{ color: "#94a3b8" }}>Thinking…</small>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Quick Suggestions ─── */}
      {showSuggestions && (
        <div style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              style={styles.suggestionChip}
              onClick={() => handleSuggestion(s)}
              onMouseEnter={(e) => (e.target.style.background = "#FFE4CC")}
              onMouseLeave={(e) => (e.target.style.background = "#FFF4E8")}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ─── Input Area ─── */}
      <div style={styles.footer}>
        <div style={styles.inputGroup}>
          <textarea
            ref={inputRef}
            id="ai-chat-input"
            rows={1}
            style={styles.input}
            placeholder="Ask SmartRide AI…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B00")}
            onBlur={(e) => (e.target.style.borderColor = "#FFE4CC")}
            disabled={isLoading}
            maxLength={2000}
          />
          <button
            id="ai-chat-send-btn"
            style={styles.sendBtn}
            onClick={() => sendMessage()}
            disabled={isLoading || !inputText.trim()}
            title="Send message"
          >
            {isLoading ? (
              <div
                className="spinner-border spinner-border-sm"
                style={{ width: 16, height: 16 }}
                role="status"
              ></div>
            ) : (
              <i className="bi bi-send-fill"></i>
            )}
          </button>
        </div>

        <div style={styles.poweredBy}>
          <i className="bi bi-stars me-1" style={{ color: "#FF6B00" }}></i>
          Powered by Google Gemini • SmartRide AI
          {isAuthenticated && (
            <span style={{ color: "#FF6B00", marginLeft: 6 }}>• Personalized</span>
          )}
        </div>
      </div>
    </div>
  );
}
