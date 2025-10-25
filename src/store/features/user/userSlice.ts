// src/store/features/user/userSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
	token: string | null;
	username: string | null;
	email: string | null;
	isAdmin: boolean;
}

const initialState: UserState = {
	token: null,
	username: null,
	email: null,
	isAdmin: false,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		loginUser: (
			state,
			action: PayloadAction<{
				token: string;
				user: { username: string; email: string; isAdmin?: boolean };
			}>
		) => {
			state.token = action.payload.token;
			state.username = action.payload.user.username || "some_name";
			state.email = action.payload.user.email || "some_name@mail.com";
			state.isAdmin = action.payload.user.isAdmin || false;
		},

		logoutUser: (state) => {
			state.token = null;
			state.username = null;
			state.email = null;
		},

		logoutUserFully: (state) => {
			state.token = null;
			state.username = null;
			state.email = null;
			state.isAdmin = false;
			console.log("-----> Finished Super Logout !!!");
		},
	},
});

export const { loginUser, logoutUser, logoutUserFully } = userSlice.actions;

export default userSlice.reducer;
