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
      if (roomIndex  === -1){
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
        
        // Check if the message is not already in the messages array
        const isMessageAlreadyAdded = room.messages.some((msg) => msg.time === time);
        
        if (!isMessageAlreadyAdded) {
          room.messages.push(message);
        }
      }
    },
  },
});

export const { setRooms, addRoom, addMessageToRoom } = roomSlice.actions;

export default roomSlice.reducer;
