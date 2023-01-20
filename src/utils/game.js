const cards = require("./cards.json");

const users = [];

const addUser = async (redisClient, { username, room }) => {
  console.log(username)
  username = username.trim().toLowerCase();
  console.log(username)
  room = room.trim().toLowerCase();
  await redisClient.set("players/" + username + "/game", room);

  let gameData = await redisClient.get("games/" + room);

  //si la game existe et que le joueur n'est pas dedans
  if (gameData && !gameData.includes(username)) {
    await redisClient.APPEND("games/" + room, " " + username);
  } else if (!gameData) {
    console.log("new game");
    await redisClient.set("games/" + room, username);
  }
};

const getUser = async (redisClient, { username }) => {
  const value = await redisClient.get("players/" + username + "/game");
  return value;
};

const getGamePlayers = async (redisClient, room) => {
  const value = await redisClient.get("games/" + room);
  return value;
};

const removeDeckCard = async (redisClient, userDeck, room, options) => {
  let card = options.cardId.split("-");
  let cardJSON = {
    type: card[0],
    ...(card[1] ? { color: card[1] } : {}),
    ...(card[2] ? { number: card[2] } : {}),
  };

  let i;
  userDeck.forEach((element, index) => {
    if (JSON.stringify(element) == JSON.stringify(cardJSON)) {
      i = index;
    }
  });

  userDeck.splice(i, 1);

  await redisClient.set(
    "games/" + room + "/player/" + options.username,
    JSON.stringify(userDeck)
  );

  return userDeck;
};

const getGamePlayersDeck = async (redisClient, room, username) => {
  if (!(await redisClient.get("games/" + room + "/player/" + username))) {
    await redisClient.set(
      "games/" + room + "/player/" + username,
      JSON.stringify(getRandomDeck())
    );
  }
  return await redisClient.get("games/" + room + "/player/" + username);
};

const removeUser = async (redisClient, username) => {
  await redisClient.del("players/" + username + "/game");
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getGamePlayers,
  getGamePlayersDeck,
  removeDeckCard,
};

//private
function getRandomDeck() {
  let arrayCards = [];
  let nbCards = 7;

  for (let i = 0; i < nbCards; i++) {
    arrayCards.push(getRandomCard());
  }

  return arrayCards;
}

function getRandomCard() {
  return cards.list[Math.floor(Math.random() * cards.list.length)];
}
