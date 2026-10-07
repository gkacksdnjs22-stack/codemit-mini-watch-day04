import { request } from "./client.js";
export const getNotes = (signal) => request("/notes", { signal });
export const getNote = (id, signal) => request(`/notes/${id}`, { signal });
export const createNote = (values) =>
  request("/notes", { method: "POST", body: values });
export const updateNote = (id, values) =>
  request(`/notes/${id}`, { method: "PUT", body: values });
export const deleteNote = (id) => request(`/notes/${id}`, { method: "DELETE" });
