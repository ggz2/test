const WebSocket = require('ws');

const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

let clients = [];

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

server.on('connection', (ws) => {
  // When a new client connects
  ws.isAlive = true;
  clients.push(ws);
  console.log('New client connected');

  // Receive message from client
  ws.on('message', (message) => {
    // Broadcast the message to all clients
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    // Remove client from list
    clients = clients.filter(c => c !== ws);
    console.log('Client disconnected');
  });

  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Heartbeat to detect dead connections
setInterval(() => {
  for (let ws of clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      clients = clients.filter(c => c !== ws);
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);
