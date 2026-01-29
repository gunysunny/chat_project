import "dotenv/config";
import http from "http";
import { WebSocketServer } from "ws";
import { createClient } from "@supabase/supabase-js";

const PORT = Number(process.env.PORT || 8080);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const COUPLES_TABLE = process.env.COUPLES_TABLE || "couplesTable";
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || "messages";

// coupleId -> Set<WebSocket>
const rooms = new Map();

function safeSend(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function joinRoom(ws, coupleId) {
  if (!rooms.has(coupleId)) rooms.set(coupleId, new Set());
  rooms.get(coupleId).add(ws);
}

function leaveRoom(ws, coupleId) {
  const set = rooms.get(coupleId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) rooms.delete(coupleId);
}

function broadcast(coupleId, payload) {
  const set = rooms.get(coupleId);
  if (!set) return;
  for (const client of set) safeSend(client, payload);
}

function getToken(reqUrl) {
  const u = new URL(reqUrl, "http://localhost");
  return u.searchParams.get("token");
}

async function getUserFromToken(token) {
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

async function findCoupleId(userId) {
  const { data, error } = await supabase
    .from(COUPLES_TABLE)
    .select("id,user1_id,user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .maybeSingle();

  if (error) return null;
  return data?.id ?? null;
}

async function saveMessage({ coupleId, senderId, content }) {
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert([{ couple_id: coupleId, sender_id: senderId, content }])
    .select("id,couple_id,sender_id,content,created_at")
    .single();

  if (error) return null;
  return data;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ok");
});
const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  // 1) token 인증
  const token = getToken(req.url);
  const user = await getUserFromToken(token);

  if (!user) {
    safeSend(ws, { type: "error", message: "Unauthorized (token invalid)" });
    ws.close(1008, "Unauthorized");
    return;
  }

  // 2) 커플 찾기
  const userId = user.id;
  const coupleId = await findCoupleId(userId);

  if (!coupleId) {
    safeSend(ws, { type: "error", message: "커플이 없습니다. couplesTable 확인!" });
    ws.close(1008, "No couple");
    return;
  }

  // 3) 룸 join + ready
  joinRoom(ws, coupleId);
  safeSend(ws, { type: "ready", userId, coupleId });

  // 접속 알림(필요 없으면 지워도 됨)
  broadcast(coupleId, { type: "presence", userId, online: true });

  // 4) 메시지 처리
  ws.on("message", async (raw) => {
    console.log("[WS] recv raw:", raw.toString()); // ✅ 이거

    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    console.log("[WS] recv parsed:", msg); // ✅ 이거

    if (msg.type === "chat") {
      // ✅ 프론트 payload 방식 + 기존 content 방식 둘 다 지원
      const text = String(msg?.payload?.content ?? msg?.content ?? "").trim();
      if (!text) return;

      const saved = await saveMessage({
        coupleId,
        senderId: userId,
        content: text,
      });

      if (!saved) {
        safeSend(ws, { type: "error", message: "메시지 저장 실패" });
        return;
      }

      broadcast(coupleId, { type: "chat", message: saved });
    }
  });

  // 5) 종료
  ws.on("close", () => {
    leaveRoom(ws, coupleId);
    broadcast(coupleId, { type: "presence", userId, online: false });
  });

  ws.on("close", (code, reason) => {
    console.log("WS close:", code, reason?.toString());
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ WS server running on port ${PORT}`);
});