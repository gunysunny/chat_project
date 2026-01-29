
export type Msg = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  pending?: boolean; // ✅ optimistic 표시용
};

export type ReadyPayload = {
  userId: string;
  coupleId: string;
};

export type PresencePayload = {
  userId: string;
  online: boolean;
};

export type ErrorPayload = {
  message: string;
};

export type SendChatPayload = {
  content: string;
};

export type WsServerEnvelope =
  | { type: "ready"; payload: ReadyPayload }
  | { type: "presence"; payload: PresencePayload }
  | { type: "chat"; payload: Msg }
  | { type: "error"; payload: ErrorPayload };

// (호환용) 서버가 payload 없이 보내는 경우를 최소 지원하고 싶으면 아래처럼 union 확장 가능
export type WsServerLegacy =
  | ({ type: "ready" } & Partial<ReadyPayload> & { payload?: ReadyPayload })
  | ({ type: "presence" } & Partial<PresencePayload> & { payload?: PresencePayload })
  | ({ type: "chat"; message?: Msg } & { payload?: Msg })
  | ({ type: "error" } & Partial<ErrorPayload> & { payload?: ErrorPayload });

export type WsClientEnvelope =
  | { type: "chat"; payload: SendChatPayload };


  