import { createSlice } from "@reduxjs/toolkit";

const hostDataSclice = createSlice({
    name:"hostData",
    initialState:{},
    reducers:{
        setHostData : function(state,action){
            return action.payload
        }}
    }

)

export const {setHostData} = hostDataSclice.actions
export default hostDataSclice.reducer