import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import express from "express";
import cors from "cors"; 
import crypto from 'crypto';
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';

dotenv.config();
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
  hybridKey: String,
  publicKey: {
    iv: String,
    encryptedData: String
  },
  privateKey: {
    iv: String,
    encryptedData: String
  },
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
const Encrypter = process.env.ENCRYPT_KEY
const Decrypter = process.env.DECRYPT_KEY
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
function generateRandomKeyPair(){
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'der'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'der'
  }
});
return [publicKey , privateKey]
}

function derToArrayBuffer(der) {
  const binaryString = Buffer.from(der, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const encryptMessage = async (message, publicKeyDER) => {
  const publicKeyArrayBuffer = derToArrayBuffer(publicKeyDER);
 
  const publicKey = await crypto.subtle.importKey(
    'spki',  
    publicKeyArrayBuffer,
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    true,
    ['encrypt']
  );
 
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
 
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );

  const encryptedBase64 = Buffer.from(encryptedData).toString('base64');

  return encryptedBase64;
};

 async function decryptMessage(encryptedBase64, privateKey) { 
  const encryptedBinaryString = atob(encryptedBase64);
   
  const encryptedData = new Uint8Array(encryptedBinaryString.length);
  for (let i = 0; i < encryptedBinaryString.length; i++) {
    encryptedData[i] = encryptedBinaryString.charCodeAt(i);
  }
  const privateKeyBuffer = derToArrayBuffer(privateKey);
  const importedPrivateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    true,
    ['decrypt']
  );
 
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    importedPrivateKey,
    encryptedData
  );
 
  const decryptedMessage = new TextDecoder().decode(decryptedData);
  
  return decryptedMessage;
}

function generateSymmetricKey() {
  return crypto.randomBytes(32).toString('base64');
}
 
function encryptDataWithSymmetricKey(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    iv: iv.toString('base64'),
    encryptedData: encrypted
  };
}

function decryptDataWithSymmetricKey(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  var userName = socket.handshake.query.userName;
  var name = socket.handshake.query.name;
  var image = socket.handshake.query.image;
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
  socket.on("check-room", async ({ users, groupName, type }) => {
    if (type == "private") {
      const room = await Rooms.findOne({
        members: {
          $all: users,
          $size: users.length,
        },
      });
      if (room) {
        console.log("private room exists");
        socket.emit("private-room-exists");
      } else {
        const [publicKey , privateKey] = generateRandomKeyPair(); 
        const hybridKey = generateSymmetricKey()
        const publicKeyBase64 =  publicKey.toString('base64');
        const privateKeyBase64 =  privateKey.toString('base64'); 
        const publicKeyBase64Encrypted =  encryptDataWithSymmetricKey(publicKeyBase64 , hybridKey)
        const privateKeyBase64Encrypted =  encryptDataWithSymmetricKey(privateKeyBase64 , hybridKey)
        const encryptedHybridKey = await encryptMessage(hybridKey, Encrypter)
        const newRoom = new Rooms({
          id: uuidv4(),
          type: type,
          members: users,
          hybridKey: encryptedHybridKey,
          publicKey: publicKeyBase64Encrypted, //room to improve
          privateKey: privateKeyBase64Encrypted,
          name: groupName,
          messages: [],
        });
        saveRoomAndEmit(newRoom, users, UserMap);
      }
    } else {
      let newRoomId = uuidv4();
      const [publicKey , privateKey] = generateRandomKeyPair(); 
      const hybridKey = generateSymmetricKey()
      const publicKeyBase64 =  publicKey.toString('base64');
        const privateKeyBase64 =  privateKey.toString('base64'); 
        const publicKeyBase64Encrypted =  encryptDataWithSymmetricKey(publicKeyBase64 , hybridKey)
        const privateKeyBase64Encrypted =  encryptDataWithSymmetricKey(privateKeyBase64 , hybridKey)
      const encryptedHybridKey = await encryptMessage(hybridKey, Encrypter)
      let message = {
        from: "io",
        to: newRoomId,
        time: String(new Date().getTime()),
        content: `${name} created group "${groupName}"`,
      };
      const newRoom = new Rooms({
        id: newRoomId,
        type: type,
        members: users,
        hybridKey: encryptedHybridKey,
        publicKey: publicKeyBase64Encrypted, //room to improve
        privateKey: privateKeyBase64Encrypted,
        name: groupName,
        messages: [message],
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
      if(message.from === 'io'){
        room.messages.push(message);
        await room.save();
        io.to(room.id).emit("sent-message", message);
      }
      else{
        const decryptedHybridKey = await decryptMessage(room.hybridKey , Decrypter)
        const decryptedPublicKey = decryptDataWithSymmetricKey(room.publicKey.encryptedData , decryptedHybridKey , room.publicKey.iv) 
        const encryptedData = await encryptMessage(message.content , decryptedPublicKey);
        const encryptedMessage = {...message , content: encryptedData}
        room.messages.push(encryptedMessage);
        await room.save();
        io.to(room.id).emit("sent-message", encryptedMessage);
      }
      
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
  socket.on("user-change", async ({ fullName, imageUrl, username }) => {
    userName = username;
    image = imageUrl;
    name = fullName;

    const existingUser = await User.findOne({ id: userId });
    if (existingUser) {
      const shouldUpdateName = existingUser.name !== fullName;
      const shouldUpdateUsername = existingUser.userName !== username;
      const shouldUpdateImage = existingUser.image !== imageUrl;

      if (shouldUpdateName || shouldUpdateUsername || shouldUpdateImage) {
        const updates = {};

        if (shouldUpdateName) {
          updates.name = fullName;
        }

        if (shouldUpdateUsername) {
          updates.userName = username;
        }

        if (shouldUpdateImage) {
          updates.image = imageUrl;
        }

        await User.updateOne({ id: userId }, updates);
        io.emit("updated-user", { id: userId, fullName, imageUrl, username });
      }
    }
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
