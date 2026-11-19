import { useState } from "react";
import { submitScore, fetchLeaderboard } from "../api.js";
import formatTime from "../formatTime.js";

export default function WinModal({ gameId, imageId, timeMs, onPlayAgain }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null); // null = not shown yet

  async function showLeaderboard() {
    try {
      setLeaderboard(await fetchLeaderboard(imageId));
    } catch {
      setLeaderboard([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitScore(gameId, name);
      await showLeaderboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="win-title">
        <h2 id="win-title">You found everyone! 🎉</h2>
        <p className="modal__time">Your time: {formatTime(timeMs)}</p>

        {leaderboard === null ? (
          <form onSubmit={handleSubmit} className="score-form">
            <label htmlFor="player-name">Enter your name for the leaderboard</label>
            <div className="score-form__row">
              <input
                id="player-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                required
                autoFocus
              />
              <button type="submit" disabled={submitting || !name.trim()}>
                {submitting ? "Saving…" : "Submit"}
              </button>
            </div>
            {error && <p className="score-form__error">{error}</p>}
            <button type="button" className="link-button" onClick={showLeaderboard}>
              Skip
            </button>
          </form>
        ) : (
          <>
            <h3>Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <p>No scores yet.</p>
            ) : (
              <ol className="leaderboard">
                {leaderboard.map((s) => (
                  <li key={s.id} className={s.id === gameId ? "is-you" : undefined}>
                    <span>{s.playerName}</span>
                    <span>{formatTime(s.durationMs)}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <button type="button" className="primary-button" onClick={onPlayAgain}>
          Play again
        </button>
      </div>
    </div>
  );
}
