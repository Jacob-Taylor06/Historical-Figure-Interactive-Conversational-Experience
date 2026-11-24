import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [figureName, setFigureName] = useState("");
  const [node, setNode] = useState(null);
  const [state, setState] = useState({});
  const [error, setError] = useState("");

  async function startSession() {
    setError("");
    const res = await fetch(`${API_URL}/api/session/start`, { method: "POST" });
    const payload = await res.json();
    setSessionId(payload.sessionId);
    setFigureName(payload.figureName);
    setNode(payload.node);
    setState(payload.state);
  }

  useEffect(() => {
    startSession();
  }, []);

  async function handleChoice(choiceId) {
    setError("");
    const res = await fetch(`${API_URL}/api/conversation/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, choiceId }),
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error || "Something went wrong");
      return;
    }
    setNode(payload.node);
    setState(payload.state);
  }

  if (error) return <p>Error: {error}</p>;
  if (!node) return <p>Loading...</p>;

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>{figureName}</h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.75 }}>Rapport: {state.rapport ?? 0}</p>
      <p><strong>{node.speakerLine}</strong></p>
      {node.context && <p style={{ fontSize: "0.95rem" }}><em>{node.context}</em></p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
        {node.choices.map((choice) => (
          <button key={choice.id} onClick={() => handleChoice(choice.id)}>
            {choice.label}
          </button>
        ))}
      </div>

      {node.choices.length === 0 && (
        <button style={{ marginTop: "1rem" }} onClick={startSession}>
          Restart Conversation
        </button>
      )}
    </main>
  );
}
