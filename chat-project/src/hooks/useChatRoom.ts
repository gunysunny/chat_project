import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createAuthedWS, sendChat } from "@/lib/ws";
import type { Msg } from "@/types/message";

type Status = "connecting" | "open" | "closed";

function isSameText(a: string, b: string) {
  return a.trim() === b.trim();
}

export function useChatRoom() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("connecting");

  const myIdRef = useRef<string>("");
  const coupleIdRef = useRef<string>("");

  const retryRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const connectingRef = useRef(false);

  const myId = myIdRef.current;

  const canSend = useMemo(() => ws?.readyState === WebSocket.OPEN, [ws, ready]);

  const clearRetryTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleReconnect = useCallback(() => {
    clearRetryTimer();
    const attempt = ++retryRef.current;
    const delay = Math.min(1000 * 2 ** (attempt - 1), 10000); // 1s,2s,4s,8s... max 10s
    timerRef.current = window.setTimeout(() => {
      connect();
    }, delay);
  }, []);

  const connect = useCallback(async () => {
    if (connectingRef.current) return;
    connectingRef.current = true;

    setError(null);
    setStatus("connecting");

    let socket: WebSocket | null = null;

    try {
      // 1) 내 userId
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setError("로그인이 필요합니다.");
        setStatus("closed");
        return;
      }
      myIdRef.current = uid;

      // 2) coupleId
      const { data: couple, error: coupleErr } = await supabase
        .from("couplesTable")
        .select("id")
        .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
        .maybeSingle();

      if (coupleErr || !couple?.id) {
        setError("커플 정보를 찾을 수 없습니다.");
        setStatus("closed");
        return;
      }
      coupleIdRef.current = couple.id;

      // 3) 초기 메시지 로드 (첫 연결 때만 로드하고 싶으면 retryRef.current===0 조건 걸어도 됨)
      const { data: msgs, error: msgErr } = await supabase
        .from("messages")
        .select("id,sender_id,content,created_at")
        .eq("couple_id", couple.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (!msgErr && msgs) setMessages(msgs as Msg[]);

      // 4) WS 연결
      socket = await createAuthedWS({
        onReady: () => setReady(true),
        onPresence: (p) => {
          if (p.userId === myIdRef.current) return;
          setOnline(p.online);
        },
        onChat: (m) => {
          setMessages((prev) => {
            // 이미 있으면 패스
            if (prev.some((x) => x.id === m.id)) return prev;

            // 내가 보낸 메시지가 서버에서 돌아온 경우: pending 하나 교체
            if (m.sender_id === myIdRef.current) {
              const idx = prev.findIndex(
                (x) => x.pending && x.sender_id === m.sender_id && isSameText(x.content, m.content)
              );

              if (idx !== -1) {
                const next = prev.slice();
                next[idx] = { ...m, pending: false };
                return next;
              }
            }

            return [...prev, m];
          });
        },
        onError: (e) => setError(e.message),
      });

      clearRetryTimer();
      retryRef.current = 0;

      setWs(socket);
      setStatus("open");

      socket.onclose = () => {
        setWs(null);
        setReady(false);
        setStatus("closed");
        // 자동 재연결
        scheduleReconnect();
      };
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
      setWs(null);
      setReady(false);
      setStatus("closed");
      // 에러 나도 재연결 시도
      scheduleReconnect();
    } finally {
      connectingRef.current = false;
    }
  }, [scheduleReconnect]);

  useEffect(() => {
    connect();
    return () => {
      clearRetryTimer();
      ws?.close();
    };
  }, []);

  const reconnect = () => {
    clearRetryTimer();
    retryRef.current = 0;
    ws?.close(); // close되면 onclose에서 재연결이 걸리긴 함
    connect();   // 즉시 재연결도 한번 때려줌
  };

  const send = (content: string) => {
    const v = content.trim();
    if (!v || !ws) return;

    // optimistic: 임시 메시지 먼저 추가
    const tempId = `temp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const optimistic: Msg = {
      id: tempId,
      sender_id: myIdRef.current,
      content: v,
      created_at: new Date().toISOString(),
      pending: true,
    };

  setMessages((prev) => [...prev, optimistic]);

  sendChat(ws, v);
};

  return {
    ws,
    ready,
    online,
    messages,
    myId,
    canSend,
    status,
    error,
    send,
    reconnect, 
  };
}