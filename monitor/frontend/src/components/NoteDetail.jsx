import Icon from "./Icon.jsx";
import NoteStatus from "./NoteStatus.jsx";

export default function NoteDetail({
  note,
  onEdit,
  onDelete,
  onCreate,
  loading,
}) {
  if (loading)
    return (
      <div className="detail-placeholder" role="status">
        메모 내용을 불러오는 중…
      </div>
    );
  if (!note)
    return (
      <div className="detail-placeholder">
        <span className="placeholder-icon">
          <Icon name="note" size={30} />
        </span>
        <h3>기록할 준비가 되었나요?</h3>
        <p>
          목록에서 메모를 선택하거나
          <br />
          새로운 관찰을 남겨 보세요.
        </p>
        <button className="secondary" onClick={onCreate}>
          <Icon name="plus" size={16} />새 메모 작성
        </button>
      </div>
    );
  return (
    <article className="note-detail">
      <div className="detail-top">
        <span className="note-number">
          NOTE {String(note.id).padStart(3, "0")}
        </span>
        <div>
          <button className="text-button" onClick={onEdit}>
            수정
          </button>
          <button className="text-button danger-text" onClick={onDelete}>
            삭제
          </button>
        </div>
      </div>
      <h3>{note.title}</h3>
      <NoteStatus status={note.status} />
      <p className="detail-date">
        마지막 수정 {new Date(note.updated_at).toLocaleString("ko-KR")}
      </p>
      <div className="note-body">{note.body}</div>
      <span className="detail-tag">
        <Icon name="note" size={14} />
        관찰 메모
      </span>
    </article>
  );
}
