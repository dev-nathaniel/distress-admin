import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        token: null
    },
    reducers: {
        login(state, action) {
            console.log(action.payload, 'login reducer')
            state.token = action.payload;
        },
        logout(state) {
            state.token = null;
        }
    }
})

export const {login, logout} = userSlice.actions
export default userSlice.reducer