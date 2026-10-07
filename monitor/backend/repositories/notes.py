from db import connect_db


def serialize(row):
    if row is not None:
        row["created_at"] = row["created_at"].isoformat()
        row["updated_at"] = row["updated_at"].isoformat()
    return row


def list_notes():
    with connect_db() as conn:
        rows = conn.execute("SELECT id, title, created_at, updated_at FROM notes ORDER BY id DESC").fetchall()
    return [serialize(row) for row in rows]


def find_note(note_id):
    with connect_db() as conn:
        row = conn.execute("SELECT * FROM notes WHERE id = %s", (note_id,)).fetchone()
    return serialize(row)


def create_note(title, body):
    with connect_db() as conn:
        row = conn.execute(
            "INSERT INTO notes (title, body) VALUES (%s, %s) RETURNING *", (title, body)
        ).fetchone()
    return serialize(row)


def update_note(note_id, title, body):
    with connect_db() as conn:
        row = conn.execute(
            "UPDATE notes SET title = %s, body = %s, updated_at = NOW() WHERE id = %s RETURNING *",
            (title, body, note_id),
        ).fetchone()
    return serialize(row)


def delete_note(note_id):
    with connect_db() as conn:
        row = conn.execute("DELETE FROM notes WHERE id = %s RETURNING id", (note_id,)).fetchone()
    return row
