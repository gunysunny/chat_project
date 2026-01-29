import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Fields = {
  email: string;
  pw: string;
  nickname: string;
};

function validate({ email, pw, nickname }: Fields): string | null {
  const cleanEmail = email.trim();
  const cleanPw = pw.trim();
  const cleanNick = nickname.trim();

  if (!cleanNick || cleanNick.length < 2) return "닉네임을 2자 이상 입력해줘!";
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) return "이메일 형식이 올바르지 않습니다. 예: test@gmail.com";
  if (cleanPw.length < 6) return "비밀번호는 최소 6자 이상이어야 합니다.";
  return null;
}

export function useSignUp() {
  const nav = useNavigate();

  const [fields, setFields] = useState<Fields>({
    email: "",
    pw: "",
    nickname: "",
  });

  const [loading, setLoading] = useState(false);

  const setField = (key: keyof Fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    const err = validate(fields);
    if (err) return { ok: false as const, message: err };

    const cleanEmail = fields.email.trim();
    const cleanPw = fields.pw.trim();
    const cleanNick = fields.nickname.trim();

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPw,
      options: { data: { nickname: cleanNick } },
    });
    setLoading(false);

    if (error) return { ok: false as const, message: error.message };

    // Confirm sign up 설정에 따라 session 유무가 달라질 수 있음
    if (data.session) nav("/home");
    else nav("/login");

    return { ok: true as const };
  };

  return {
    fields,
    setField,
    loading,
    submit,
  };
}