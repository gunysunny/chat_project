import { supabase } from "@/lib/supabase";
import { ChevronLeft, ShieldCheck, Wifi, WifiOff, LogOut } from "lucide-react";

export default function ChatHeader({
  title = "1:1 채팅",
  status,
  partnerOnline,
  onBack,
  onReconnect,
}: {
  title?: string;
  status: "connecting" | "open" | "closed";
  partnerOnline: boolean | null;
  onBack?: () => void;
  onReconnect?: () => void;
}) {
  const statusBadge =
    status === "open"
      ? { text: "연결됨", Icon: Wifi }
      : status === "connecting"
      ? { text: "연결중", Icon: ShieldCheck }
      : { text: "연결 끊김", Icon: WifiOff };

  const onlineText =
    partnerOnline === null ? "상태 확인중" : partnerOnline ? "온라인" : "오프라인";

  const Icon = statusBadge.Icon;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-xl p-2 hover:bg-white/10"
            aria-label="Back"
            type="button"
          >
            <ChevronLeft className="h-5 w-5 text-white/80" />
          </button>

          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">{title}</div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                <Icon className="h-3.5 w-3.5" />
                {statusBadge.text}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                {onlineText}
              </span>

              {status === "closed" && onReconnect && (
                <button
                  type="button"
                  onClick={onReconnect}
                  className="ml-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-white hover:bg-white/15"
                >
                  다시 연결
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
          onClick={() => supabase.auth.signOut()}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </header>
  );
}