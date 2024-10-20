import { createSlice } from "@reduxjs/toolkit";


const socketSlice = createSlice({
    name:"socket",
    initialState:{},
    reducers:{
        setSocket : function(state,action){
            return action.payload
        }}
})

export const {setSocket} = socketSlice.actions
export default socketSlice.reducer