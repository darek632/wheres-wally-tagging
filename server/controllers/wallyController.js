import * as db from "../db/queries.js";

const isFraction = (n) => Number.isFinite(n) && n >= 0 && n <= 1;

// GET /api/image
async function getImage(req, res) {
  const image = await db.getFirstImage();
  if (!image) {
    return res.status(404).json({ error: "No image found" });
  }
  res.json(image); // { id, name, url, characters: [{ id, name }] }
}

// POST /api/games   body: { imageId }
// Starts a new round. The server records the start time.
async function postGame(req, res) {
  const imageId = Number(req.body.imageId);
  if (!Number.isInteger(imageId)) {
    return res.status(400).json({ error: "Invalid imageId" });
  }

  const image = await db.getImageById(imageId);
  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  const game = await db.createGame(imageId);
  res.status(201).json({ gameId: game.id });
}

// POST /api/games/:gameId/guess   body: { characterId, x, y }
async function postGuess(req, res) {
  const { gameId } = req.params;
  const characterId = Number(req.body.characterId);
  const x = Number(req.body.x);
  const y = Number(req.body.y);

  if (!Number.isInteger(characterId) || !isFraction(x) || !isFraction(y)) {
    return res.status(400).json({ error: "Invalid guess" });
  }

  const game = await db.getGameById(gameId);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }
  if (game.finishedAt) {
    return res.status(400).json({ error: "This game is already finished" });
  }

  const character = await db.getCharacterById(characterId);
  // The character must exist AND belong to this game's image
  if (!character || character.imageId !== game.imageId) {
    return res.status(404).json({ error: "Character not found" });
  }

  const { xMin, xMax, yMin, yMax } = character;
  const correct = x >= xMin && x <= xMax && y >= yMin && y <= yMax;

  if (!correct) {
    return res.json({ correct: false });
  }

  // Record the find (once), using the server's own list – not anything the client says
  let foundIds = game.foundCharacterIds;
  if (!foundIds.includes(characterId)) {
    const updated = await db.addFoundCharacter(gameId, characterId);
    foundIds = updated.foundCharacterIds;
  }

  const allIds = game.image.characters.map((c) => c.id);
  const finished = allIds.every((id) => foundIds.includes(id));

  let timeMs;
  if (finished) {
    const finishedAt = new Date();
    timeMs = finishedAt - game.startedAt; // both times recorded by the server
    await db.finishGame(gameId, finishedAt, timeMs);
  }

  res.json({
    correct: true,
    character: { id: character.id, name: character.name },
    marker: { x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 },
    finished,
    timeMs, // only present when finished
  });
}

// POST /api/games/:gameId/score   body: { name }
async function postScore(req, res) {
  const { gameId } = req.params;
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

  if (name.length < 1 || name.length > 30) {
    return res.status(400).json({ error: "Name must be 1–30 characters" });
  }

  const saved = await db.saveScore(gameId, name);
  if (!saved) {
    // Game doesn't exist, isn't finished, or already has a name
    return res.status(409).json({ error: "Score can't be saved for this game" });
  }

  res.status(201).json({ saved: true });
}

// GET /api/leaderboard?imageId=1
async function getLeaderboard(req, res) {
  const imageId = Number(req.query.imageId);
  if (!Number.isInteger(imageId)) {
    return res.status(400).json({ error: "Invalid imageId" });
  }

  const scores = await db.getLeaderboard(imageId);
  res.json(scores);
}

export { getImage, postGame, postGuess, postScore, getLeaderboard };