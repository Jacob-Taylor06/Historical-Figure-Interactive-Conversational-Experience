const express = require("express");
const cors = require("cors");
const data = require("./data/figure.json");

const app = express();
app.use(cors());
app.use(express.json());

const sessions = new Map();

app.post("/api/session/start", (req, res) => {
  const sessionId = String(Date.now());
  const state = { ...data.initialState };
  sessions.set(sessionId, { state });
  res.json({
    sessionId,
    figureName: data.figureName,
    greeting: data.greeting,
    state,
  });
});

app.post("/api/conversation/step", (req, res) => {
  const { sessionId, message } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  const cleanMessage = message.toLowerCase().trim();

  const matchedTopic = data.topics.find((topic) =>
    topic.keywords.some((keyword) => cleanMessage.includes(keyword.toLowerCase()))
  );

  const responseObj = matchedTopic || data.fallback;
  session.state.rapport += responseObj.rapportDelta || 0;

  res.json({
    speakerLine: responseObj.speakerLine,
    context: responseObj.context,
    state: session.state,
  });
});

app.listen(3001, () => {
  console.log("Express server running on http://localhost:3001");
});
