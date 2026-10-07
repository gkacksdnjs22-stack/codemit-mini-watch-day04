export default function NoteList({
  notes,
  selectedId,
  onSelect,
  disabled,
  loading,
  failed,
}) {
  return (
    <div className="notes-list" aria-label="메모 목록" aria-busy={loading}>
      <p className="list-label">
        관찰 기록 <span>{notes.length}</span>
      </p>
      {!notes.length && (
        <p className="empty-state">
          {loading
            ? "메모를 불러오는 중…"
            : failed
              ? "메모 목록을 조회하지 못했습니다."
              : "아직 메모가 없어요.\n첫 관찰을 기록해 보세요."}
        </p>
      )}
      {notes.map((note) => (
        <button
          key={note.id}
          className={`note-item ${note.id === selectedId ? "selected" : ""}`}
          onClick={() => onSelect(note.id)}
          disabled={disabled}
          aria-pressed={note.id === selectedId}
        >
          <span className="note-number">
            NOTE {String(note.id).padStart(3, "0")}
          </span>
          <strong>{note.title}</strong>
          <span className="note-date">
            {new Date(note.updated_at).toLocaleDateString("ko-KR")}
          </span>
        </button>
      ))}
    </div>
  );
}
