// Defaults to the Vite dev proxy (/api -> http://localhost:5000).
// For a deployed build, set VITE_API_URL (e.g. https://my-backend.com/api).
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 90000;

export const analyzeGitHubProfile = async (
  username,
  isPreset = false,
  presetType = null,
  externalSignal = null
) => {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/analysis/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, isPreset, presetType }),
        signal: controller.signal
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        if (timedOut) throw new Error('The analysis took too long. Please try again.');
        throw err; // cancelled by the user: callers ignore this
      }
      throw new Error('Cannot reach the server. Make sure the backend is running.');
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      // non-JSON response (proxy error page, crashed server, ...)
    }

    if (!response.ok) {
      throw new Error(payload?.error || `Server error (${response.status}). Please try again.`);
    }
    if (!payload || !payload.success || !payload.data) {
      throw new Error('The server returned an unexpected response.');
    }

    return payload;
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }
};
