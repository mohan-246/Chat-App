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
    updateUser: (state, action) => {
      const { id, username, fullName, imageUrl } = action.payload;
      const userToUpdate = state.users.find((user) => user.id === id);

      if (userToUpdate) {
        userToUpdate.userName = username;
        userToUpdate.name = fullName;
        userToUpdate.image = imageUrl;
      } else {
        console.log("User not found");
      }
    },
  },
});

export const { setUsers, addUser, removeUserRoom , updateUser } = usersSlice.actions;

export default usersSlice.reducer;
