import { useEffect, useState } from "react";
import { getEvents } from "../api/events.js";
import Icon from "./Icon.jsx";

export default function EventsPanel({ refreshKey }) {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getEvents(controller.signal)
      .then(({ events }) => {
        setEvents(events);
        setUpdated(new Date());
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshKey, refresh]);

  const visible = events.filter(
    (event) =>
      event.path.toLowerCase().includes(query.trim().toLowerCase()) &&
      (!status || String(event.status_code) === status),
  );
  const errors = visible.filter((event) => event.status_code >= 400).length;

  return (
    <section id="events" aria-labelledby="events-title">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>조회한 요청</span>
            <span className="stat-icon">
              <Icon name="pulse" />
            </span>
          </div>
          <div className="stat-value">
            {updated ? visible.length : "—"}
            <span>건</span>
          </div>
          <p>현재 목록 · 최근 50건 내 검색 결과</p>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span>오류 응답</span>
            <span className="stat-icon amber">
              <Icon name="shield" />
            </span>
          </div>
          <div className="stat-value">
            {updated ? errors : "—"}
            <span>건</span>
          </div>
          <p>현재 목록 · 상태 코드 400 이상</p>
        </div>
        <div className="stat-card accent">
          <div className="stat-top">
            <span>마지막 조회</span>
            <Icon name="refresh" />
          </div>
          <div className="stat-time">
            {updated
              ? updated.toLocaleTimeString("ko-KR", { hour12: false })
              : "—"}
          </div>
          <p>
            {loading
              ? "최신 기록을 불러오는 중"
              : error
                ? "조회 실패 · 다시 시도해 주세요"
                : "일반 서비스에서 수집한 요청 기록"}
          </p>
        </div>
      </div>
      <div className="panel events-panel">
        <div className="panel-heading">
          <div>
            <h2 id="events-title">
              요청 기록 <span className="count">{visible.length}</span>
            </h2>
            <p className="muted">
              실제 서비스의 메서드, 경로, 응답 상태를 확인합니다.
            </p>
          </div>
          <button
            className="text-button"
            disabled={loading}
            onClick={() => setRefresh((value) => value + 1)}
          >
            <Icon name="refresh" size={16} />
            기록 새로고침
          </button>
        </div>
        <div className="filters">
          <div className="search-field">
            <Icon name="search" size={17} />
            <input
              aria-label="요청 경로 검색"
              placeholder="요청 경로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="응답 상태 코드"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">모든 상태 코드</option>
            {[...new Set(events.map((event) => event.status_code))]
              .sort((a, b) => a - b)
              .map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
          </select>
          <button
            className="text-button"
            onClick={() => {
              setQuery("");
              setStatus("");
            }}
            disabled={!query && !status}
          >
            조건 해제
          </button>
        </div>
        {error && (
          <p role="alert" className="message error">
            {error}
            {updated && " 이전 조회 결과를 표시하고 있습니다."}
          </p>
        )}
        <div className="table-wrap" aria-busy={loading}>
          <table>
            <thead>
              <tr>
                <th>요청 방법</th>
                <th>경로</th>
                <th>상태 코드</th>
                <th>발생 시각</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span className="method">{event.method}</span>
                  </td>
                  <td className="path">{event.path}</td>
                  <td>
                    <span
                      className={`status ${event.status_code >= 400 ? "status-error" : event.status_code >= 300 ? "status-redirect" : ""}`}
                    >
                      {event.status_code}
                      <i />
                    </span>
                  </td>
                  <td className="time-cell">
                    {new Date(event.occurred_at).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p className="empty-state">
              {loading
                ? "요청 기록을 불러오고 있어요…"
                : error
                  ? "요청 기록을 조회하지 못했습니다."
                  : events.length
                    ? "검색 조건에 맞는 요청이 없습니다."
                    : "아직 요청 기록이 없어요. 일반 게시판에 접속한 뒤 새로고침해 주세요."}
            </p>
          )}
        </div>
        <div className="table-footer">
          최근 50건을 최신순으로 표시합니다.
          <a href={import.meta.env.VITE_GENERAL_URL || "http://127.0.0.1:5100/"} target="_blank" rel="noreferrer">
            일반 게시판 열기 <Icon name="arrow" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
