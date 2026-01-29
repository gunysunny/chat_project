import { useEffect, useMemo, useRef } from "react";
import type { Msg } from "@/types/message";
import { buildMessageRows } from "@/utils/chatRows";
import MessageItem from "@/components/chat/MessageItem";

export default function MessageList({ messages, myId }: { messages: Msg[]; myId: string }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const rows = useMemo(() => buildMessageRows(messages), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="relative flex-1 overflow-y-auto">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/bg-chat.jpg)" }}
      />
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />

      {/* 내용 */}
      <div className="relative p-4 space-y-2">
        {rows.map((row) => {
          if (row.kind === "divider") {
            return (
              <div key={row.id} className="flex justify-center py-3">
                <span className="text-[11px] text-white/70 bg-white/10 border border-white/10 rounded-full px-3 py-1 backdrop-blur">
                  {row.label}
                </span>
              </div>
            );
          }

          const mine = row.msg.sender_id === myId;
          return <MessageItem key={row.id} msg={row.msg} mine={mine} />;
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}