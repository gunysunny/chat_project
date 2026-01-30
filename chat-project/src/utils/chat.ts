import type { Msg } from "@/types/message";

export function dateKey(iso: string) {
  const d = new Date(iso);
  // 로컬 기준 날짜키 (YYYY-MM-DD)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateLabel(key: string) {
  // key: YYYY-MM-DD
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export type RenderRow =
  | { kind: "divider"; id: string; label: string }
  | { kind: "message"; id: string; msg: Msg };

export function buildRenderRows(messages: Msg[]): RenderRow[] {
  const rows: RenderRow[] = [];
  let prevKey: string | null = null;

  for (const msg of messages) {
    const k = dateKey(msg.created_at);
    if (k !== prevKey) {
      rows.push({ kind: "divider", id: `d:${k}`, label: formatDateLabel(k) });
      prevKey = k;
    }
    rows.push({ kind: "message", id: `m:${msg.id}`, msg });
  }

  return rows;
}