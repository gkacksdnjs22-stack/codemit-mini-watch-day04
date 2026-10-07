import { useState } from "react";
import { portalLogin } from "../api/portal.js";

export default function LoginForm({ csrfToken, registered, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setPending(true);
    try { onLogin(await portalLogin(username, password, csrfToken)); }
    catch (error) { setError(error.message); }
    finally { setPending(false); }
  }
  return <main className="auth-card">
    <a className="site-brand" href="/">✿ 모아</a>
    <span className="badge auth-badge">다정한 이야기가 모이는 곳</span>
    <h1>모아에 로그인</h1>
    <p className="intro">로그인하면 나의 공간으로 바로 안내할게요.</p>
    {registered && <p className="form-success" role="status">회원가입이 완료됐어요. 새 계정으로 로그인해 주세요.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <form onSubmit={submit} noValidate>
      <label htmlFor="username">아이디</label>
      <input id="username" name="username" value={username} onChange={(event) => setUsername(event.target.value)}
        autoComplete="username" maxLength={64} disabled={pending} />
      <label htmlFor="password">비밀번호</label>
      <input id="password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password" maxLength={128} disabled={pending} />
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "계정을 확인하고 있어요…" : "로그인"}</button>
    </form>
    <p className="auth-footer">처음 오셨나요? <a href="/signup">회원가입</a></p>
  </main>;
}
