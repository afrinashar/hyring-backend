const express = require("express");
const { WebSocketServer } = require("ws");

const PORT = 8080;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

const wss = new WebSocketServer({ server });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("New client connected. Total clients:", clients.size);

  // Notify other clients
  broadcast({ type: "notification", message: "A new user has joined." });

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Handle different event types
    if (data.type === "draw") {
      broadcast({ type: "draw", ...data }, ws);
    } else if (data.type === "reset") {
      broadcast({ type: "reset" });
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcast({ type: "notification", message: "A user has disconnected." });
    console.log("Client disconnected. Total clients:", clients.size);
  });
});

 function broadcast(data, sender) {
  clients.forEach((client) => {
    if (client !== sender && client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
 