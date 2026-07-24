import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("jwtToken");
const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (action.payload.token) {
        localStorage.setItem("jwtToken", action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
