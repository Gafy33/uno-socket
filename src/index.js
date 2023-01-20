const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {
  addUser,
  getUser,
  getGamePlayers,
  getGamePlayersDeck,
  removeDeckCard,
} = require("./utils/game");

const redis = require("redis");
const client = redis.createClient();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
	cors: {
		origins: [
			"http://localhost:5173",
      "https://uno-web.clementindescamps.fr"
		],
	},
});

const port = process.env.PORT || 3000;
// const publicDirectoryPath = path.join(__dirname, "../public");

// app.use(express.static(publicDirectoryPath));

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

server.listen(port, async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  // await client.disconnect();
  console.log(`App is listening on port ${port}.`);
});

io.on("connection", (socket) => {
  socket.on("join", async ({ username, room }, callback) => {
    console.log(username)
    await addUser(client, { username, room });

    socket.join(room);

    const usersRoom = await getGamePlayers(client, room);

    const userDeck = await getGamePlayersDeck(client, room, username);

    io.to(room).emit("getGamePlayersDeck", userDeck);
    io.to(room).emit("getGamePlayers", usersRoom);
    callback();
  });

  socket.on("sendPlay", async (options, callback) => {
    const userRoom = JSON.parse(await getUser(client, { ...options }));

    const userDeck = await getGamePlayersDeck(
      client,
      userRoom,
      options.username
    );

    const newUserDeck = await removeDeckCard(
      client,
      JSON.parse(userDeck),
      userRoom,
      options
    );

    io.to(userRoom).emit("getGamePlayersDeck", JSON.stringify(newUserDeck));

    callback();
  });

  // socket.on("disconnect", () => {
  //   const user = removeUser(client, socket.id);

  //   if (user) {
  //     io.to(user.room).emit(
  //       "message",
  //       generateMessage("Admin", `${user.username} has left!`)
  //     );
  //     io.to(user.room).emit("roomData", {
  //       room: user.room,
  //       users: getUsersInRoom(user.room),
  //     });
  //   }
  // });
});
