import { useState } from "react";
import { NOTE_STATUSES } from "../note-status.js";

export default function NoteForm({ note, onSave, onCancel, pending }) {
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [status, setStatus] = useState(note?.status || "pending");
  return (
    <form
      className="note-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ title, body, status });
      }}
      noValidate
    >
      <p className="eyebrow">
        {note ? `EDIT NOTE ${note.id}` : "NEW OBSERVATION"}
      </p>
      <h3>{note ? "관찰 메모 수정" : "새 관찰 메모"}</h3>
      <label htmlFor="note-title">제목</label>
      <input
        id="note-title"
        placeholder="어떤 흐름을 발견했나요?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={200}
        disabled={pending}
        autoFocus
      />
      <label htmlFor="note-body">내용</label>
      <textarea
        id="note-body"
        placeholder="확인한 요청 경로와 응답, 관찰한 내용을 적어 주세요."
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={10000}
        disabled={pending}
        rows={7}
      />
      <p className="form-hint">제목 200자 · 내용 10,000자 이내</p>
      <label htmlFor="note-status">처리 상태</label>
      <select id="note-status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={pending}>
        {NOTE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <div className="form-actions">
        <button
          className="secondary"
          type="button"
          onClick={onCancel}
          disabled={pending}
        >
          취소
        </button>
        <button className="primary" disabled={pending}>
          {pending ? "저장 중…" : note ? "수정 저장" : "메모 저장"}
        </button>
      </div>
    </form>
  );
}
