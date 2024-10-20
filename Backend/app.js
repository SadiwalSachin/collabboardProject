import express from "express"
import cors from "cors"
const app = express()

app.use(cors({
    origin:"*",
    credentials:true
}))

app.use(express.urlencoded({
    extended:true
}))

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("App is connected")
})

export {app}