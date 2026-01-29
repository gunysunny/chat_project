import AppShell from "@/components/layout/AppShell";
import { CalendarDays, StickyNote, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <AppShell>
      {/* Hero / Background Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10">
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/bg-home.jpg)" }}
        />
        {/* 어두운 오버레이 + 블러 느낌 */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="relative p-6 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
            <Sparkles className="h-4 w-4" />
            오늘도 우리 기록하기
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
            우리만의 공간,
            <span className="text-pink-300"> 한 곳에</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-white/70">
            채팅 · 디데이 · 캘린더 · 메모를 한 화면에서. 카톡처럼 편하게, 더 우리답게.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              <MessageCircle className="h-4 w-4" />
              채팅 열기
            </Link>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
              <CalendarDays className="h-4 w-4" />
              디데이/캘린더
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15">
              <StickyNote className="h-4 w-4" />
              메모
            </button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">상대 상태</div>
          <div className="mt-1 text-xs text-white/60">온라인/오프라인을 깔끔하게</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">우리 디데이</div>
          <div className="mt-1 text-xs text-white/60">기념일 자동 알림도 추가 가능</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">공유 메모</div>
          <div className="mt-1 text-xs text-white/60">데이트 계획/할 일 정리</div>
        </div>
      </section>
    </AppShell>
  );
}