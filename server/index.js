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
  const node = data.nodes[data.startNodeId];
  sessions.set(sessionId, { currentNodeId: node.id, state });
  res.json({ sessionId, figureName: data.figureName, node, state });
});

app.post("/api/conversation/step", (req, res) => {
  const { sessionId, choiceId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const currentNode = data.nodes[session.currentNodeId];
  const chosen = currentNode.choices.find((c) => c.id === choiceId);

  if (!chosen) {
    return res.status(400).json({ error: "Invalid choice for current node" });
  }

  const nextNode = data.nodes[chosen.nextNodeId];
  if (!nextNode) {
    return res.status(500).json({ error: "Target node missing" });
  }

  session.state.rapport += chosen.rapportDelta || 0;
  session.currentNodeId = nextNode.id;

  res.json({ node: nextNode, state: session.state });
});

app.listen(3001, () => {
  console.log("Express server running on http://localhost:3001");
});
