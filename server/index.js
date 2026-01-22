import "dotenv/config";
import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✅ client connected");

  ws.send(JSON.stringify({ type: "ready", message: "ws 연결 성공!" }));

  ws.on("message", (msg) => {
    console.log("📩 received:", msg.toString());

    // 그대로 다시 보내는 에코
    ws.send(JSON.stringify({ type: "echo", data: msg.toString() }));
  });

  ws.on("close", () => {
    console.log("❌ client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`✅ WS server running on ws://localhost:${PORT}`);
});