import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Heart, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pw.trim(),
    });
    setLoading(false);
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/bg-login.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            <span className="font-semibold">Couple</span>
          </div>

          <h1 className="mt-4 text-xl font-semibold tracking-tight">로그인</h1>
          <p className="mt-1 text-sm text-white/70">우리만의 공간으로 들어가기</p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
              <Mail className="h-4 w-4 text-white/60" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
              <Lock className="h-4 w-4 text-white/60" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
                placeholder="password"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </div>

            <button
              className="w-full rounded-2xl bg-white py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
              onClick={onLogin}
              disabled={loading}
            >
              {loading ? "처리중..." : "로그인"}
            </button>

            <div className="text-sm text-white/70">
              계정이 없어?{" "}
              <Link className="underline font-medium text-white" to="/signup">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}