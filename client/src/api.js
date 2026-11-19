// All calls to the backend live here, so components don't need to know URLs.
// In development the Express server runs on port 3000. When you deploy,
// set VITE_API_URL in client/.env to your real server address.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Small helper: send a request, throw if the server returns an error status.
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// { id, name, url, characters: [{ id, name }] }
export function fetchImage() {
  return request("/image");
}

// Starts a round on the server (which records the start time). → { gameId }
export function startGame(imageId) {
  return request("/games", {
    method: "POST",
    body: JSON.stringify({ imageId }),
  });
}

// → { correct: false } or { correct: true, character, marker, finished, timeMs? }
export function sendGuess(gameId, characterId, x, y) {
  return request(`/games/${gameId}/guess`, {
    method: "POST",
    body: JSON.stringify({ characterId, x, y }),
  });
}

export function submitScore(gameId, name) {
  return request(`/games/${gameId}/score`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// → [{ id, playerName, durationMs, finishedAt }]
export function fetchLeaderboard(imageId) {
  return request(`/leaderboard?imageId=${imageId}`);
}
