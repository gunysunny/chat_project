import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";

function Main() {
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWS = () => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => console.log("✅ ws open");
    socket.onmessage = (e) => console.log("📩", e.data);
    socket.onclose = () => console.log("❌ ws close");
    socket.onerror = (e) => console.log("⚠️ ws error", e);

    setWs(socket);
  };

  const sendTest = () => {
    if (!ws) return alert("먼저 WS 연결부터 해줘!");
    ws.send("hello from frontend");
  };

  const disconnectWS = () => {
    if (!ws) return;
    ws.close();
    setWs(null);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">메인 화면</h1>
      <p className="text-gray-600">로그인 성공!</p>

      <div className="mt-4 flex gap-2">
        <button className="border px-3 py-2 rounded" onClick={connectWS}>
          WS 연결
        </button>

        <button className="border px-3 py-2 rounded" onClick={sendTest}>
          메시지 보내기
        </button>

        <button className="border px-3 py-2 rounded" onClick={disconnectWS}>
          연결 끊기
        </button>

        <button
          className="border px-3 py-2 rounded"
          onClick={() => supabase.auth.signOut()}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6">로딩중...</div>;
  if (!session) return <Login />;

  return <Main />;
}