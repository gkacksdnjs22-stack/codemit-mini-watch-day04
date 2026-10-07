import { useState } from "react";
import EventsPanel from "./EventsPanel.jsx";
import NotesPanel from "./NotesPanel.jsx";
import Icon from "./Icon.jsx";

export default function Dashboard({ user, onLogout, loggingOut }) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-icon">
            <Icon name="pulse" />
          </span>
          모아<span className="brand-dot">.</span>
        </a>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="대시보드 메뉴">
          <a className="active" href="#overview">
            <Icon name="grid" />
            대시보드
          </a>
          <a href="#events">
            <Icon name="pulse" />
            요청 기록
          </a>
          <a href="#notes">
            <Icon name="note" />
            관찰 메모
          </a>
          <a href={`${import.meta.env.VITE_GENERAL_URL || "http://127.0.0.1:5100/"}board`}>✿ 모아 게시판</a>
        </nav>
        <div className="sidebar-bottom">
          <p>
            살펴보고, 이해하고,
            <br />
            다음 관찰을 기록하세요.
          </p>
          <span>모아 · 01</span>
        </div>
      </aside>
      <div className="workspace" id="overview">
        <header className="topbar">
          <span>
            Workspace <span className="crumb">/</span>{" "}
            <strong>서비스 관찰</strong>
          </span>
          <div className="account">
            <span className="avatar">
              {(user.name || user.username).slice(0, 1)}
            </span>
            <span>{user.name || user.username}</span>
            <button className="logout" onClick={onLogout} disabled={loggingOut}>
              <Icon name="logout" size={16} />
              {loggingOut ? "로그아웃 중…" : "로그아웃"}
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="page-heading">
            <div>
              <p className="eyebrow">SERVICE OBSERVATORY</p>
              <h1>감시 대시보드</h1>
              <p className="muted">
                서비스의 흐름을 확인하고, 중요한 발견을 기록하세요.
              </p>
            </div>
            <button
              className="secondary"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              <Icon name="refresh" size={17} />
              전체 새로고침
            </button>
          </div>
          <EventsPanel refreshKey={refreshKey} />
          <NotesPanel refreshKey={refreshKey} />
          <footer className="dashboard-footer">
            <span>모아.</span>
            <span>관찰은 기록에서 시작됩니다.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
