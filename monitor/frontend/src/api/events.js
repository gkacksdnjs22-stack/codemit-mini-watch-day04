import { request } from "./client.js";
export const getEvents = (signal) => request("/events", { signal });
