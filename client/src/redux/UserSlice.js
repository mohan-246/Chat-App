import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  name: null,
  userName: null,
  image: null,
  curChat: null,
  myrooms: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setId: (state, action) => {
      state.id = action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setImage: (state, action) => {
      state.image = action.payload;
    },
    setCurChat: (state, action) => {
      state.curChat = action.payload;
    },
    setMyRooms: (state, action) => {
      state.myrooms = action.payload;
    },
    joinRoom: (state, action) => {
      const { id } = action.payload;
      const roomIndex = state.myrooms.findIndex((room) => room.id == id);
      if (roomIndex === -1) {
        state.myrooms.push(action.payload);
      }
    },
    leaveRoom: (state, action) => {
      state.myrooms = state.myrooms.filter(
        (room) => room.id !== action.payload.roomid
      );
    },
  },
});

export const {
  setId,
  setName,
  setMyRooms,
  leaveRoom,
  joinRoom,
  setUserName,
  setImage,
  setCurChat,
} = userSlice.actions;

export default userSlice.reducer;
