import { useEffect, useState } from "react";

function App() {
  const [sessionId, setSessionId] = useState("");
  const [figureName, setFigureName] = useState("King Arthur");
  const [messages, setMessages] = useState([]);
  const [contextNote, setContextNote] = useState("");
  const [state, setState] = useState({ rapport: 0 });
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");

  async function startSession() {
    setError("");
    const response = await fetch("http://localhost:3001/api/session/start", {
      method: "POST",
    });
    const payload = await response.json();

    setSessionId(payload.sessionId);
    setFigureName(payload.figureName);
    setState(payload.state);
    setContextNote("Ask about the Round Table, Excalibur, Merlin, or the Saxons.");
    setMessages([{ sender: payload.figureName, text: payload.greeting }]);
  }

  useEffect(() => {
    startSession();
  }, []);

  async function handleSend(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setError("");

    const response = await fetch("http://localhost:3001/api/conversation/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: userMessage }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Something went wrong");
      return;
    }

    setState(payload.state);
    setContextNote(payload.context);
    setMessages((prev) => [
      ...prev,
      { sender: "You", text: userMessage },
      { sender: figureName, text: payload.speakerLine },
    ]);
  }

  return (
    <main style={{ maxWidth: "680px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>{figureName}</h1>
      <p>
        <strong>Rapport:</strong> {state.rapport}
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          minHeight: "260px",
          maxHeight: "380px",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index} style={{ marginBottom: "0.75rem" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>

      {contextNote && (
        <p style={{ fontStyle: "italic", color: "#444", marginBottom: "1rem" }}>
          {contextNote}
        </p>
      )}

      <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak to King Arthur..."
          style={{ flex: 1, padding: "0.6rem" }}
        />
        <button type="submit" style={{ padding: "0.6rem 1.2rem" }}>
          Send
        </button>
      </form>

      <button onClick={startSession} style={{ marginTop: "1rem" }}>
        Restart Conversation
      </button>
    </main>
  );
}

export default App;