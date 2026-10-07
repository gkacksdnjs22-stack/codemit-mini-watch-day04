import { useEffect, useRef } from "react";

export default function DeleteConfirm({ note, onConfirm, onCancel, pending }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="delete-dialog"
      aria-labelledby="delete-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
    >
      <p className="eyebrow danger-text">DELETE OBSERVATION</p>
      <h3 id="delete-title">이 메모를 삭제할까요?</h3>
      <p className="delete-note-title">{note.title}</p>
      <p className="muted">
        삭제하면 목록에서 제거됩니다.
        <br />
        계속 보관하려면 취소를 눌러 주세요.
      </p>
      <div className="form-actions">
        <button
          className="secondary"
          autoFocus
          onClick={onCancel}
          disabled={pending}
        >
          삭제 취소
        </button>
        <button className="danger" onClick={onConfirm} disabled={pending}>
          {pending ? "삭제 중…" : "삭제 확정"}
        </button>
      </div>
    </dialog>
  );
}
