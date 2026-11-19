import { useEffect, useState } from "react";
import formatTime from "../formatTime.js";

// Display only: counts up from `startTime` (a Date.now() value) so the player
// can see time passing. The real, saved time comes from the server.
// When `finalMs` is given, the clock stops and shows that instead.
export default function Timer({ startTime, finalMs }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (finalMs != null) return; // stopped – no need to keep ticking
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id); // stop the interval when unmounted/stopped
  }, [finalMs]);

  const elapsed = finalMs ?? Math.max(0, now - startTime);

  return (
    <div className="timer" aria-label="Elapsed time">
      ⏱ {formatTime(elapsed)}
    </div>
  );
}
