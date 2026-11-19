import { useEffect, useRef, useState } from "react";
import TargetMenu from "./TargetMenu.jsx";

// Size of the targeting box in screen pixels.
const BOX_SIZE = 60;

export default function GameImage({
  src,
  alt,
  characters,
  markers = [],
  disabled = false,
  onSelect,
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  // target = { left, top } in px inside the container (for drawing),
  //          x, y as 0–1 fractions of the image (for the backend).
  const [target, setTarget] = useState(null);

  function handleImageClick(e) {
    if (disabled) return;

    // If a box is already open, a click on the photo just closes it
    // ("click away"); the next click opens a new one.
    if (target) {
      setTarget(null);
      return;
    }

    const rect = imgRef.current.getBoundingClientRect();
    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;

    setTarget({
      left,
      top,
      // Normalised coordinates: independent of screen size / zoom, so they
      // can be compared against the positions stored in the database.
      x: left / rect.width,
      y: top / rect.height,
      // Which side the menu should open on, so it never runs off the image.
      flipX: left > rect.width - 220,
      flipY: top > rect.height - 200,
    });
  }

  // Close when clicking anywhere outside the image/menu, or pressing Escape.
  useEffect(() => {
    if (!target) return;

    function handlePointerDown(e) {
      if (!containerRef.current.contains(e.target)) setTarget(null);
    }
    function handleKey(e) {
      if (e.key === "Escape") setTarget(null);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [target]);

  function handleSelect(character) {
    onSelect(character, { x: target.x, y: target.y });
    setTarget(null); // remove the box until the user clicks again
  }

  return (
    <div
      className={`game-image${disabled ? " is-disabled" : ""}`}
      ref={containerRef}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onClick={handleImageClick}
        draggable={false}
      />

      {/* Markers use percentages, so they stay on the character
          whatever size the image is displayed at. */}
      {markers.map((m) => (
        <div
          key={m.id}
          className="marker"
          style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
        >
          <span className="marker__label">{m.name}</span>
        </div>
      ))}

      {target && (
        <>
          <div
            className="target-box"
            style={{
              left: target.left - BOX_SIZE / 2,
              top: target.top - BOX_SIZE / 2,
              width: BOX_SIZE,
              height: BOX_SIZE,
            }}
          />
          <TargetMenu
            characters={characters}
            position={target}
            boxSize={BOX_SIZE}
            onSelect={handleSelect}
          />
        </>
      )}
    </div>
  );
}
