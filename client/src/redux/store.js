import { configureStore } from "@reduxjs/toolkit";
import RoomReducer from "./RoomSlice";
import UserReducer from "./UserSlice";
import UsersReducer from "./UsersSlice";

export const store = configureStore({
  reducer: {
    Room: RoomReducer,
    User: UserReducer,
    Users: UsersReducer,
  },
});
