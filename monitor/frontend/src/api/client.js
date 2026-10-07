let csrfToken = "";

export async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: "same-origin",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(method === "GET" ? {} : { "X-CSRF-Token": csrfToken }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "서버에 연결할 수 없습니다. 연결 상태를 확인하고 다시 시도해 주세요.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      data?.error || `요청에 실패했습니다. (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }
  if (data === null) throw new Error("서버에서 올바른 응답을 받지 못했습니다.");
  if (data.csrf_token) csrfToken = data.csrf_token;
  return data;
}
