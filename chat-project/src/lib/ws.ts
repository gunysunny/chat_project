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

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const base = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
  const url = `${base}?token=${encodeURIComponent(token)}`;

  console.log("[WS] creating...", url);

  const ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    console.log("[WS] open", ws.url);
  });

  ws.addEventListener("error", (e) => {
    console.log("[WS] error", e);
  });

  ws.addEventListener("close", (e) => {
    console.log("[WS] close", e.code, e.reason);
  });

  await new Promise<void>((resolve, reject) => {
    const onOpen = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("WebSocket 연결 실패"));
    };

    const cleanup = () => {
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("error", onError);
    };

    ws.addEventListener("open", onOpen);
    ws.addEventListener("error", onError);
  });

  ws.onmessage = (e) => {
    // ws 메시지는 string이 아닌 경우도 있으니 방어
    const raw = typeof e.data === "string" ? e.data : String(e.data);
    const parsed = safeParseJson(raw);
    if (!parsed || typeof parsed !== "object") return;

    console.log("[WS] message raw:", raw); 

    const msg = parsed as WsServerEnvelope | WsServerLegacy;

    // payload 형태 우선, 아니면 legacy 필드에서 최대한 꺼내기
    if (msg.type === "ready") {
      const p =
        "payload" in msg && msg.payload
          ? msg.payload
          : (msg as unknown as { userId?: string; coupleId?: string });

      if (p?.userId && p?.coupleId) {
        handlers.onReady?.({ userId: p.userId, coupleId: p.coupleId });
      }
      return;
    }

    if (msg.type === "presence") {
      const p =
        "payload" in msg && msg.payload
          ? msg.payload
          : (msg as unknown as { userId?: string; online?: boolean });

      if (p?.userId && typeof p?.online === "boolean") {
        handlers.onPresence?.({ userId: p.userId, online: p.online });
      }
      return;
    }

    if (msg.type === "chat") {
      const payloadMsg =
        "payload" in msg && msg.payload
          ? msg.payload
          : (msg as unknown as { message?: unknown }).message;

      if (payloadMsg && typeof payloadMsg === "object" && "id" in (payloadMsg as any)) {
        handlers.onChat?.(payloadMsg as Msg);
      }
      return;
    }

    if (msg.type === "error") {
      const p =
        "payload" in msg && msg.payload
          ? msg.payload
          : (msg as unknown as { message?: unknown });

      if (typeof p?.message === "string") {
        handlers.onError?.({ message: p.message });
      }
      return;
    }
  };

  return ws;
}

export function sendChat(ws: WebSocket, content: string) {
  console.log("[WS] sendChat called", { readyState: ws.readyState, content });

  if (ws.readyState !== WebSocket.OPEN) {
    console.log("[WS] NOT OPEN. abort send");
    return;
  }

  const msg: WsClientEnvelope = {
    type: "chat",
    payload: { content },
  };

  console.log("[WS] sending:", msg);
  ws.send(JSON.stringify(msg));
}