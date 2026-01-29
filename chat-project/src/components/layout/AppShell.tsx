import type { PropsWithChildren } from "react";
import { MessageCircle, Heart, Settings } from "lucide-react";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            <span className="font-semibold tracking-tight">Couple</span>
          </div>

          <div className="flex items-center gap-3 text-white/80">
            <button className="rounded-lg p-2 hover:bg-white/10" aria-label="Chat">
              <MessageCircle className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 hover:bg-white/10" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-white/50">
          © {new Date().getFullYear()} Couple App
        </div>
      </footer>
    </div>
  );
}