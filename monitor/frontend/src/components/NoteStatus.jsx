import { NOTE_STATUSES } from "../note-status.js";

export default function NoteStatus({ status }) {
  const label = NOTE_STATUSES.find((item) => item.value === status)?.label || "확인 전";
  return <span className={`note-status note-status-${status}`}>{label}</span>;
}
