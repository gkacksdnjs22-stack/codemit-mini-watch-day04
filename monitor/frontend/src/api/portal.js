export async function portalLogin(username, password, csrfToken) {
  const response = await fetch("/api/auth/login", {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify({ username: username.trim(), password }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "로그인 요청을 처리할 수 없습니다.");
  return result;
}
