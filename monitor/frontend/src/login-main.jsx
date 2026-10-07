import { useState } from "react";
import { createRoot } from "react-dom/client";
import LoginForm from "./components/LoginForm.jsx";

const root = document.getElementById("portal-login");
function LoginApp() {
  const [user, setUser] = useState(null);
  function signedIn(result) {
    setUser(result.user);
    window.location.assign(result.destination);
  }
  return user ? <main className="auth-card" role="status">{user.name}님, 이동하고 있어요…</main>
    : <LoginForm csrfToken={root.dataset.csrf} registered={root.dataset.registered === "true"} onLogin={signedIn} />;
}
createRoot(root).render(<LoginApp />);
