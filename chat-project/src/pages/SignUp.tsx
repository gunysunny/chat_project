import SignUpForm from "@/components/auth/SignUpForm";
import { useSignUp } from "@/hooks/useSignUp";

export default function SignUp() {
  const { fields, setField, loading, submit } = useSignUp();

  const onSubmit = async () => {
    const res = await submit();
    if (!res.ok) alert(res.message);
  };

  return (
    <SignUpForm
      nickname={fields.nickname}
      email={fields.email}
      pw={fields.pw}
      loading={loading}
      onChangeNickname={(v) => setField("nickname", v)}
      onChangeEmail={(v) => setField("email", v)}
      onChangePw={(v) => setField("pw", v)}
      onSubmit={onSubmit}
    />
  );
}