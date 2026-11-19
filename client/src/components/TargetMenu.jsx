export default function TargetMenu({ characters, position, boxSize, onSelect }) {
  const gap = boxSize / 2 + 8;

  // Place the menu beside the box, flipping sides near the right/bottom edge.
  const style = {
    left: position.flipX ? undefined : position.left + gap,
    right: position.flipX ? `calc(100% - ${position.left - gap}px)` : undefined,
    top: position.flipY ? undefined : position.top - boxSize / 2,
    bottom: position.flipY
      ? `calc(100% - ${position.top + boxSize / 2}px)`
      : undefined,
  };

  return (
    <ul className="target-menu" style={style} role="menu">
      <li className="target-menu__title">Who is it?</li>
      {characters.map((c) => (
        <li key={c.id}>
          <button type="button" role="menuitem" onClick={() => onSelect(c)}>
            {c.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
