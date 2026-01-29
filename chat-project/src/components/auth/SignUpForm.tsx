import { Link } from "react-router-dom";

export default function SignUpForm({
  nickname,
  email,
  pw,
  loading,
  onChangeNickname,
  onChangeEmail,
  onChangePw,
  onSubmit,
}: {
  nickname: string;
  email: string;
  pw: string;
  loading: boolean;
  onChangeNickname: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangePw: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-3 border bg-white p-5 rounded-2xl shadow-sm">
        <h1 className="text-xl font-bold">회원가입</h1>

        <input
          className="w-full border p-2 rounded"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => onChangeNickname(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="password (6자 이상)"
          type="password"
          value={pw}
          onChange={(e) => onChangePw(e.target.value)}
        />

        <button className="w-full border px-3 py-2 rounded" onClick={onSubmit} disabled={loading}>
          {loading ? "처리중..." : "회원가입"}
        </button>

        <div className="text-sm text-gray-600">
          이미 계정이 있어?{" "}
          <Link className="underline font-medium" to="/login">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}