import { supabase } from "@/lib/supabase";
import type {
  Msg,
  WsServerEnvelope,
  WsServerLegacy,
  WsClientEnvelope,
  ReadyPayload,
  PresencePayload,
  ErrorPayload,
} from "@/types/message";

type WsHandlers = {
  onReady?: (p: ReadyPayload) => void;
  onPresence?: (p: PresencePayload) => void;
  onChat?: (messageRow: Msg) => void;
  onError?: (p: ErrorPayload) => void;
};

function safeParseJson(data: string): unknown | null {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function createAuthedWS(handlers: WsHandlers) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("로그인이 필요합니다.");

  const base = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
  const ws = new WebSocket(`${base}?token=${encodeURIComponent(token)}`);

  // OPEN까지 기다려서 return (send 안정)
  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = () => reject(new Error("WebSocket 연결 실패"));
  });

  ws.onmessage = (e) => {
    const parsed = safeParseJson(e.data);
    if (!parsed || typeof parsed !== "object") return;

    const msg = parsed as WsServerEnvelope | WsServerLegacy;

    // payload 형태 우선, 아니면 legacy 필드에서 최대한 꺼내기
    if (msg.type === "ready") {
      const p = "payload" in msg && msg.payload ? msg.payload : (msg as any);
      if (p?.userId && p?.coupleId) handlers.onReady?.({ userId: p.userId, coupleId: p.coupleId });
      return;
    }

    if (msg.type === "presence") {
      const p = "payload" in msg && msg.payload ? msg.payload : (msg as any);
      if (p?.userId && typeof p?.online === "boolean")
        handlers.onPresence?.({ userId: p.userId, online: p.online });
      return;
    }

    if (msg.type === "chat") {
      const payloadMsg = "payload" in msg && msg.payload ? msg.payload : (msg as any).message;
      if (payloadMsg?.id) handlers.onChat?.(payloadMsg as Msg);
      return;
    }

    if (msg.type === "error") {
      const p = "payload" in msg && msg.payload ? msg.payload : (msg as any);
      if (typeof p?.message === "string") handlers.onError?.({ message: p.message });
      return;
    }
  };

  return ws;
}

export function sendChat(ws: WebSocket, content: string) {
  if (ws.readyState !== WebSocket.OPEN) return;

  const msg: WsClientEnvelope = {
    type: "chat",
    payload: { content },
  };

  ws.send(JSON.stringify(msg));
}