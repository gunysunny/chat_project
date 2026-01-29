import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { useChatRoom } from "@/hooks/useChatRoom";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const nav = useNavigate();
  const { status, online, messages, myId, canSend, send, reconnect } = useChatRoom();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <ChatHeader
        title="1:1 채팅"
        status={status}
        partnerOnline={online}
        onBack={() => nav("/home")}
        onReconnect={reconnect}
      />

      <MessageList messages={messages} myId={myId} />
      <ChatInput disabled={!canSend} onSend={send} />
    </div>
  );
}