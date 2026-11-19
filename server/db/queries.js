import {prisma} from "../db/prisma.js";


// make sure select never includes the x/y min/max values!
async function getImageWithCharacters(imageId) {
  return prisma.image.findUnique({
    where: { id: imageId },
    select: {
      id: true,
      name: true,
      url: true,
      characters: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
  });
}


//only use this on the backend, never send to the front as character has the correct answer coordinates
async function getCharacterById(characterId) { 

    return prisma.character.findUnique({
        where: {id: characterId},
    })
}
//image plus characters for the dropdown

async function getFirstImage() {
  return prisma.image.findFirst({
    select: {
      id: true, name: true, url: true,
      characters: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
  });
}

async function getImageById(imageId) { 
  return prisma.image.findUnique({
    where:{id: imageId}
  })
}

async function getGameById(gameId) {
  return prisma.game.findUnique({
    where: {id: gameId},
      include: { 
        image: {select: {
          characters: {select: {id: true}}
        }}
      }
  })
}

async function createGame(imageId) {
  return prisma.game.create({
    // startedAt is set here by the server, so the player can't influence it
    data: { imageId, startedAt: new Date() },
    select: { id: true, imageId: true, startedAt: true },
  });
}

async function addFoundCharacter(gameId, characterId) {
  return prisma.game.update({
    where: { id: gameId },
    data: { foundCharacterIds: { push: characterId } },
    select: { foundCharacterIds: true },
  });
}

async function finishGame(gameId, finishedAt, durationMs) {
  return prisma.game.update({
    where: { id: gameId },
    data: { finishedAt, durationMs },
  });
}

// Only saves if the game is finished AND has no name yet.
// Returns the number of rows changed: 1 = saved, 0 = not allowed.
async function saveScore(gameId, playerName) {
  const result = await prisma.game.updateMany({
    where: { id: gameId, finishedAt: { not: null }, playerName: null },
    data: { playerName },
  });
  return result.count;
}


async function getLeaderboard(imageId, limit = 10) {
  return prisma.game.findMany({
    where: { imageId, playerName: { not: null } },
    orderBy: { durationMs: "asc" },
    take: limit,
    select: { id: true, playerName: true, durationMs: true, finishedAt: true },
  });
}



export {
  getFirstImage,
  getImageById,
  getCharacterById,
  createGame,
  getGameById,
  addFoundCharacter,
  finishGame,
  saveScore,
  getLeaderboard,
};