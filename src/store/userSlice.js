import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        token: localStorage.getItem('token') ? localStorage.getItem('token') : "",
        user: [],
        chat: [],
        groups: []
    },
    reducers: {
        addToken: (state, action) => {
            state.token = action.payload
        },
        addUser: (state, action) => {
            state.user = action.payload
        },
        addChat: (state, action) => {
            state.chat = action.payload
        },
        addgroups: (state, action) => {
            state.groups = action.payload
        }

    }
})

export const { addToken, addUser, addChat, addgroups } = userSlice.actions

export default userSlice.reducer