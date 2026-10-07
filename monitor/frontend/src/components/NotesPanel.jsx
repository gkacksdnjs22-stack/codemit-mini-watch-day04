import { useEffect, useRef, useState } from "react";
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "../api/notes.js";
import NoteList from "./NoteList.jsx";
import NoteDetail from "./NoteDetail.jsx";
import NoteForm from "./NoteForm.jsx";
import DeleteConfirm from "./DeleteConfirm.jsx";
import Icon from "./Icon.jsx";

export default function NotesPanel({ refreshKey }) {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("view");
  const [confirm, setConfirm] = useState(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const selectionRequest = useRef(0);
  const currentSelection = useRef(null);
  const currentMode = useRef(mode);
  currentSelection.current = selected?.id ?? null;
  currentMode.current = mode;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getNotes(controller.signal)
      .then(async ({ notes }) => {
        setNotes(notes);
        const id = currentSelection.current;
        if (id !== null) {
          const version = selectionRequest.current;
          if (!notes.some((note) => note.id === id)) {
            if (currentMode.current === "view") {
              setSelected(null);
              setMessage("선택한 메모가 삭제되어 목록을 갱신했습니다.");
            }
          } else if (currentMode.current === "view") {
            const { note } = await getNote(id, controller.signal);
            if (
              !controller.signal.aborted &&
              version === selectionRequest.current &&
              currentSelection.current === id &&
              currentMode.current === "view"
            )
              setSelected(note);
          }
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // 수정 중에는 목록만 갱신하며 작성 중인 내용을 덮어쓰지 않습니다.
  }, [refreshKey, refresh]);

  async function select(id) {
    const version = ++selectionRequest.current;
    setMode("view");
    setSelected(null);
    setError("");
    setMessage("");
    setDetailLoading(true);
    try {
      const { note } = await getNote(id);
      if (version === selectionRequest.current) setSelected(note);
    } catch (error) {
      if (version === selectionRequest.current) setError(error.message);
    } finally {
      if (version === selectionRequest.current) setDetailLoading(false);
    }
  }

  function startNew() {
    ++selectionRequest.current;
    setDetailLoading(false);
    setMode("new");
    setError("");
    setMessage("");
  }

  async function save(values) {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const { note } =
        mode === "edit"
          ? await updateNote(selected.id, values)
          : await createNote(values);
      ++selectionRequest.current;
      setSelected(note);
      setMode("view");
      setMessage("메모를 저장했습니다.");
      setRefresh((value) => value + 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      await deleteNote(confirm.id);
      ++selectionRequest.current;
      setSelected(null);
      setConfirm(null);
      setMessage("메모를 삭제했습니다.");
      setRefresh((value) => value + 1);
    } catch (error) {
      setConfirm(null);
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id="notes"
      className="panel notes-panel"
      aria-labelledby="notes-title"
    >
      <div className="panel-heading">
        <div>
          <h2 id="notes-title">
            관찰 메모 <span className="count">{notes.length}</span>
          </h2>
          <p className="muted">
            확인한 흐름과 다음에 살펴볼 내용을 남겨 두세요.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="text-button"
            disabled={loading || pending}
            onClick={() => setRefresh((value) => value + 1)}
          >
            <Icon name="refresh" size={16} />
            메모 새로고침
          </button>
          <button
            className="primary"
            disabled={pending || mode !== "view"}
            onClick={startNew}
          >
            <Icon name="plus" size={16} />새 메모
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="message error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="message success">
          {message}
        </p>
      )}
      <div className="notes-workspace">
        <NoteList
          notes={notes}
          selectedId={selected?.id}
          onSelect={select}
          disabled={pending || mode !== "view" || confirm}
          loading={loading}
          failed={!!error}
        />
        <div className="note-editor">
          {mode === "view" ? (
            <NoteDetail
              note={selected}
              loading={detailLoading}
              onCreate={startNew}
              onEdit={() => {
                setMode("edit");
                setError("");
                setMessage("");
              }}
              onDelete={() => {
                setError("");
                setMessage("");
                setConfirm(selected);
              }}
            />
          ) : (
            <NoteForm
              key={mode === "edit" ? selected.id : "new"}
              note={mode === "edit" ? selected : null}
              onSave={save}
              onCancel={() => {
                setMode("view");
                setError("");
              }}
              pending={pending}
            />
          )}
        </div>
      </div>
      {confirm && (
        <DeleteConfirm
          note={confirm}
          pending={pending}
          onCancel={() => setConfirm(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}
