import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const UserSchema = new mongoose.Schema({
  name: String,
  userName: String,
  id: String,
  image: String,
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rooms" }],
});

const Rooms = mongoose.model("Rooms", {
  id: String,
  type: String,
  name: String,
  members: [String],
  messages: [
    {
      from: String,
      to: String,
      time: String,
      content: String,
    },
  ],
});

const User = mongoose.model("User", UserSchema);

const UserMap = new Map();
const RoomMap = {};
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
mongoose.connect("mongodb://127.0.0.1:27017/chatapp");

async function joinRooms(socket, userId) {
  const user = await User.findOne({ id: userId }).populate("rooms");

  if (user) {
    for (const room of user.rooms) {
      const roomId = room.id;
      socket.join(roomId);
      if (!RoomMap[roomId]) {
        RoomMap[roomId] = [];
      }
      RoomMap[roomId].push(socket.id);
    }
  }
}

async function leaveRooms(socket, userId) {
  const user = await User.findOne({ id: userId }).populate("rooms");

  if (user) {
    for (const room of user.rooms) {
      const roomId = room.id;
      socket.leave(roomId);
      if (RoomMap[roomId]) {
        RoomMap[roomId] = RoomMap[roomId].filter((id) => id !== socket.id);
      }
    }
  }
}

async function saveRoomAndEmit(newRoom, users, UserMap, io) {
  try {
    await newRoom.save();

    for (const userid of users) {
      const u = await User.findOne({ id: userid });
      if (!u.rooms.includes(newRoom._id)) {
        u.rooms.push(newRoom._id);
        await u.save();
      }

      const [socket] = UserMap.get(userid);
      socket.join(newRoom.id);
      socket.emit("checked-room", newRoom);
    }
  } catch (error) {
    console.log("Error while saving and emitting room:", error);
  }
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  const userName = socket.handshake.query.userName;
  const name = socket.handshake.query.name;
  const image = socket.handshake.query.image;
  UserMap.set(userId, [socket, userName, socket.id]);
  joinRooms(socket, userId);

  socket.on("new-user", async () => {
    const newUser = new User({
      userName: userName,
      name: name,
      id: userId,
      image: image,
      rooms: [],
    });

    await newUser.save();
  });

  socket.on("join-chat", async (chatId) => {
    const room = await Rooms.findOne({ id: chatId });
    if (!room) {
      return;
    }
    const user = await User.findOne({ id: userId });

    if (!user.rooms.includes(room._id)) {
      user.rooms.push(room._id);
      await user.save();
    }
    if (!RoomMap[chatId]) {
      RoomMap[chatId] = [];
    }
    RoomMap[chatId].push(socket.id);
    socket.join(chatId);
  });

  socket.on("check-room", async ({ users, name, type }) => {
    if (type == "private") {
      const room = await Rooms.findOne({
        members: {
          $all: users,
          $size: users.length,
        },
      });
      if (room) {
        socket.emit("private-room-exists");
      } else {
        const newRoom = new Rooms({
          id: uuidv4(),
          type: type,
          members: users,
          name: name,
          messages: [],
        });
        saveRoomAndEmit(newRoom, users, UserMap);
      }
    } else {
      const newRoom = new Rooms({
        id: uuidv4(),
        type: type,
        members: users,
        name: name,
        messages: [],
      });

      saveRoomAndEmit(newRoom, users, UserMap);
    }
  });

  socket.on("send-message", async (message) => {
    try {
      const room = await Rooms.findOne({ id: message.to });
      if (!room) {
        return;
      }
      room.messages.push(message);
      await room.save();
      io.to(room.id).emit("sent-message", message);
    } catch (error) {
      console.log("Error sending message:", error);
    }
  });
  socket.on("leave-room", async ({ user, room }) => {
    Rooms.updateOne({ id: room }, { $pull: { members: user } })
      .then(() => {})
      .catch((error) => {
        console.error("Error removing room:", error);
      });

    const roomToLeave = await Rooms.findOne({ id: room });

    User.updateOne({ id: userId }, { $pull: { rooms: roomToLeave._id } })
      .then(() => {})
      .catch((error) => {
        console.error("Error removing room:", error);
      });

    socket.leave(room);
    io.to(room).emit("left-room", { user, room, members: roomToLeave.members });
  });
  socket.on("add-members", async ({ users, room }) => {
    await Rooms.updateOne(
      { id: room },
      { $push: { members: { $each: users } } }
    );
    const foundRoom = await Rooms.findOne({ id: room });
    for (const userId of users) {
      await User.updateOne({ id: userId }, { $push: { rooms: foundRoom._id } });
    }
    for (const userid of users) {
      const [socket] = UserMap.get(userid);
      socket.join(room);
    }

    io.to(room).emit("added-members", { users, foundRoom });
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`Reconnected after attempt ${attemptNumber} id ${socket.id}`);
  });

  socket.on("disconnect", async () => {
    UserMap.delete(userId);
    leaveRooms(socket, userId);
  });
});

app.get("/api/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ id: userId });

  if (!user) {
    return res.status(404).json({ message: "No user found" });
  }

  const userrooms = [];
  for (const roomid of user.rooms) {
    const room = await Rooms.findOne({ _id: roomid });
    if (room) {
      userrooms.push({
        id: room.id,
        name: room.name,
        members: room.members,
        type: room.type,
      });
    }
  }

  return res.json({ userr: user, userrooms: userrooms });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  if (!users) {
    return res.status(404).json({ message: "No users found" });
  }
  return res.json(users);
});

app.get("/api/rooms/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const roomIds = user.rooms;
    const rooms = await Rooms.find({ _id: { $in: roomIds } });
    res.json(rooms);
  } catch (error) {
    console.log("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
