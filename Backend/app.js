import express from "express"
import cors from "cors"
import { verifyToken } from "./src/config/firebase.js"
import userRoutes from "./src/routes/user.routes.js"
import drawingRoutes from "./src/routes/drawing.routes.js"

const app = express()

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

app.get("/", (req, res) => {
    res.send("App is connected")
})

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/drawings", drawingRoutes)

// Example of a protected route
app.get("/api/user/profile", verifyToken, (req, res) => {
    res.json({
        message: "Authenticated successfully",
        user: req.user
    });
});

export { app }