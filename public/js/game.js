function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const socket = io();

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("getCards", (message) => {
  console.log("cards receip");
  console.log(message);
});

socket.on("getGamePlayers", (players) => {
  console.log("Players : " + players);
  console.log(players.length) 
  let playersHTML = document.querySelector("#players");
  playersHTML.innerHTML = "";
  players.split(" ").forEach((element) => {
    addUserHTML(element);
  });
});

socket.on("getGamePlayersDeck", (deck) => {
  let deckParsed = JSON.parse(deck);

  let cards = document.querySelector("#cards");
  cards.innerHTML = "";
  deckParsed.forEach((element) => {
    let id = element.color ? element.type + "-" + element.color : element.type;
    id += element.number ? "-" + element.number : "";
    addCardHTML(id);
  });
});

function sendCard(element) {
  socket.emit("sendPlay", { cardId: element.value, username }, (error) => {
    if (error) {
      return console.log(error);
    }
  });
}
socket.on("message", (message) => {
  console.log(message);
});

function addCardHTML(id) {
  let cardElement = document.createElement("button");
  cardElement.innerHTML = id;
  cardElement.setAttribute("value", id);
  cardElement.setAttribute("style", "background-color: " + getRandomGreen());
  let cards = document.querySelector("#cards");
  cards.append(cardElement);

  cards.childNodes.forEach((item) => {
    item.onclick = () => {
      sendCard(item);
    };
  });
}

function addUserHTML(user) {
  let userElement = document.createElement("p");
  userElement.innerHTML = user;

  if (user == username) {
    userElement.setAttribute("style", "color: green;");
    userElement.innerHTML = "👉 " + user;
  }

  let players = document.querySelector("#players");
  if (players.childElementCount == 0) {
    let roomHTML = document.createElement("p");
    roomHTML.setAttribute("class", "title");
    roomHTML.innerHTML = "Room : " + room;
    players.append(roomHTML);

    let titleHTML = document.createElement("p");
    titleHTML.setAttribute("class", "title");
    titleHTML.innerHTML = "Payer(s) :";
    players.append(titleHTML);
  }
  players.append(userElement);
}

function getRandomGreen() {
  const colors = [
    "#28B463",
    "#229954 ",
    "#138D75",
    "#17A589",
    "#117A65",
    "#58D68D",
    "#148F77 ",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
