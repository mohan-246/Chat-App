import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rooms: [], // Store a list of rooms, each containing messages
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },

    addRoom: (state, action) => {
      const { id, name, members, messages, type } = action.payload;

      const roomIndex = state.rooms.findIndex((room) => room.id == id);
      if (roomIndex === -1) {
        state.rooms.push({
          id,
          name,
          members,
          messages,
          type,
        });
      }
    },

    addMessageToRoom: (state, action) => {
      const { from, to, time, content } = action.payload;
      const roomIndex = state.rooms.findIndex((room) => room.id === to);

      if (roomIndex !== -1) {
        const message = { from: from, to: to, time: time, content: content };
        const room = state.rooms[roomIndex];
        const isMessageAlreadyAdded = room.messages.some(
          (msg) => msg.time === time
        );

        if (!isMessageAlreadyAdded) {
          room.messages.push(message);
        }
      }
    },
    removeUserFromRoom: (state, action) => {
      const { room } = action.payload;
      const roomIndex = state.rooms.findIndex((r) => r.id == room);

      if (roomIndex !== -1) {
        state.rooms = state.rooms.map((r, index) =>
          index === roomIndex ? { ...r, members: action.payload.members } : r
        );
      } else {
        console.log("Room not found");
      }
    },
    setRoom: (state , action)=>{
      const foundRoom  = action.payload;
      const roomIndex = state.rooms.findIndex((r) => r.id == foundRoom.id);
      if (roomIndex !== -1) {
        state.rooms[roomIndex] = foundRoom
      } else {
        state.rooms.push(foundRoom)
      }
    }
  },
});

export const { setRooms, addRoom, addMessageToRoom, removeUserFromRoom, setRoom } =
  roomSlice.actions;

export default roomSlice.reducer;
