import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    removeUserRoom: (state, action) => {
      state.users = state.users.map((user) => {
        if (user.id === action.payload.user) {
          user.rooms = user.rooms.filter(
            (room) => room !== action.payload.roomid
          );
        }
        return user;
      });
    },
  },
});

export const { setUsers, addUser, removeUserRoom } = usersSlice.actions;

export default usersSlice.reducer;
