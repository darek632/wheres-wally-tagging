import { useEffect, useRef, useState } from "react";
import GameImage from "./components/GameImage.jsx";
import Timer from "./components/Timer.jsx";
import WinModal from "./components/WinModal.jsx";
import { fetchImage, startGame, sendGuess } from "./api.js";

export default function App() {
  const [image, setImage] = useState(null); // { id, name, url, characters }
  const [game, setGame] = useState(null); // { gameId, startTime }
  const [error, setError] = useState(null);
  const [found, setFound] = useState([]); // [{ id, name, x, y }] – one marker each
  const [finalTimeMs, setFinalTimeMs] = useState(null); // set by the server when finished
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", text }
  const feedbackTimer = useRef(null);
  const hasStarted = useRef(false);

  // Ask the server to start a new round. The server records the official
  // start time; startTime here only drives the on-screen clock.
  async function beginRound(imageId) {
    const { gameId } = await startGame(imageId);
    setGame({ gameId, startTime: Date.now() });
    setFound([]);
    setFinalTimeMs(null);
  }

  // On first load: get the image, then start a round.
  useEffect(() => {
    // In development, React StrictMode runs effects twice. This guard
    // stops it creating two games on the server.
    if (hasStarted.current) return;
    hasStarted.current = true;

    fetchImage()
      .then(async (img) => {
        setImage(img);
        await beginRound(img.id);
      })
      .catch((err) => setError(err.message));
  }, []);

  function showFeedback(type, text) {
    setFeedback({ type, text });
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500);
  }

  async function handleSelect(character, coords) {
    try {
      const result = await sendGuess(game.gameId, character.id, coords.x, coords.y);

      if (!result.correct) {
        showFeedback("error", `That's not ${character.name}. Keep looking!`);
        return;
      }

      setFound((prev) =>
        prev.some((f) => f.id === result.character.id)
          ? prev
          : [...prev, { ...result.character, ...result.marker }]
      );
      showFeedback("success", `You found ${result.character.name}!`);

      // The server decides when the game is over, and what the time was.
      if (result.finished) setFinalTimeMs(result.timeMs);
    } catch (err) {
      showFeedback("error", err.message || "Couldn't reach the server. Try again.");
      console.error(err);
    }
  }

  async function handlePlayAgain() {
    try {
      await beginRound(image.id);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="status">Something went wrong: {error}</p>;
  if (!image || !game) return <p className="status">Loading…</p>;

  const remaining = image.characters.filter(
    (c) => !found.some((f) => f.id === c.id)
  );
  const finished = finalTimeMs != null;

  return (
    <div className="app">
      <header className="header">
        <h1>Where's Wally?</h1>
        <Timer key={game.gameId} startTime={game.startTime} finalMs={finalTimeMs} />
        <ul className="character-legend">
          {image.characters.map((c) => {
            const isFound = found.some((f) => f.id === c.id);
            return (
              <li key={c.id} className={isFound ? "is-found" : undefined}>
                {c.name}
              </li>
            );
          })}
        </ul>
      </header>

      <main>
        <GameImage
          src={image.url}
          alt={image.name}
          characters={remaining}
          markers={found}
          disabled={finished}
          onSelect={handleSelect}
        />

        {feedback && (
          <div className={`toast toast--${feedback.type}`} role="status">
            {feedback.text}
          </div>
        )}
      </main>

      {finished && (
        <WinModal
          key={game.gameId}
          gameId={game.gameId}
          imageId={image.id}
          timeMs={finalTimeMs}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
