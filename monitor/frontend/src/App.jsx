import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "./api/auth.js";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setChecking(true);
    setError("");
    getCurrentUser(controller.signal)
      .then(({ user }) => {
        if (user) setUser(user);
        else window.location.replace(import.meta.env.VITE_GENERAL_URL || "http://127.0.0.1:5100/");
      })
      .catch((error) => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [retry]);

  async function signOut() {
    setLoggingOut(true);
    setError("");
    try {
      // 게시판과 같은 세션 쿠키를 사용하므로 두 화면에서 함께 로그아웃합니다.
      await logout();
      setUser(null);
      window.location.assign(`${import.meta.env.VITE_GENERAL_URL || "http://127.0.0.1:5100/"}login`);
    } catch (error) { setError(error.message); }
    finally { setLoggingOut(false); }
  }

  if (checking) return <main className="detail-placeholder" role="status">로그인 상태를 확인하고 있어요…</main>;
  if (error) return <main className="detail-placeholder"><p role="alert" className="message error">{error}</p><button className="secondary" onClick={() => setRetry((value) => value + 1)}>다시 시도</button>{user && <button className="secondary" onClick={signOut} disabled={loggingOut}>로그아웃 다시 시도</button>}</main>;
  return user
    ? <Dashboard user={user} onLogout={signOut} loggingOut={loggingOut} />
    : <main className="detail-placeholder" role="status">로그인 화면으로 이동하고 있어요…</main>;
}
