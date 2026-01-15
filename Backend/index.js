import dotenv from "dotenv"
dotenv.config()

import { app } from "./app.js";
import { server } from "./src/socket/socket.js";
import connectDB from "./src/config/db.js";

// Connect to Database
connectDB();

const PORT = process.env.PORT || 3333

server.listen(PORT, () => {
    console.log("Server is listening on the port :- ", PORT)
})
