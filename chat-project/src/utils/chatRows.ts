import type { Msg } from "@/types/message";

export type MessageRow =
  | { kind: "divider"; id: string; label: string }
  | { kind: "msg"; id: string; msg: Msg };

function dateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function buildMessageRows(messages: Msg[]): MessageRow[] {
  const rows: MessageRow[] = [];
  let prev: string | null = null;

  for (const msg of messages) {
    const k = dateKey(msg.created_at);
    if (k !== prev) {
      rows.push({ kind: "divider", id: `d:${k}`, label: formatDateLabel(k) });
      prev = k;
    }
    rows.push({ kind: "msg", id: `m:${msg.id}`, msg });
  }

  return rows;
}