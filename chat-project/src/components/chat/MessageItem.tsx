import type { Msg } from "@/types/message";

export default function MessageItem({
  msg,
  mine,
}: {
  msg: Msg;
  mine: boolean;
}) {
  const timeText = msg.pending
    ? "전송중…"
    : new Date(msg.created_at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[78%] rounded-3xl px-4 py-2 shadow-sm",
          "border border-white/10",
          mine
            ? "bg-pink-400/20 text-white"
            : "bg-white/10 text-white",
          msg.pending ? "opacity-70" : "opacity-100",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
        <div className={`mt-1 text-[11px] ${mine ? "text-pink-100/80" : "text-white/60"}`}>
          {timeText}
        </div>
      </div>
    </div>
  );
}