import { app } from "./app.js";
import { server } from "./src/socket/socket.js";
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT || 3333

server.listen(PORT,()=>{
    console.log("Server is listening on the port :- ",PORT)
})
