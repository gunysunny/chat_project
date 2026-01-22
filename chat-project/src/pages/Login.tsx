import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    const cleanEmail = email.trim();
    const cleanPw = pw.trim();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      alert("이메일 형식이 올바르지 않습니다. 예: test@gmail.com");
      return;
    }

    if (cleanPw.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPw,
    });
    setLoading(false);

    if (error) return alert(error.message);
    alert("회원가입 완료! 이제 로그인 해봐.");
  };

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });
    setLoading(false);

    if (error) return alert(error.message);
    alert("로그인 성공!");
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-3 border bg-white p-5 rounded-2xl shadow-sm">
        <h1 className="text-xl font-bold">로그인 / 회원가입</h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="flex-1 border px-3 py-2 rounded"
            onClick={signUp}
            disabled={loading}
          >
            회원가입
          </button>

          <button
            className="flex-1 border px-3 py-2 rounded"
            onClick={signIn}
            disabled={loading}
          >
            로그인
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">처리중...</p>}
      </div>
    </div>
  );
}