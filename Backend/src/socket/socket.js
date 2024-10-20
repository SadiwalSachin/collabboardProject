import http from "http"
import { app } from "../../app.js"
import { Server } from "socket.io"

const server = http.createServer(app)

const io = new Server(server , {
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
})

let joinedUser = []

let drawActionData;

io.on("connection",(socket)=>{
    console.log("Connection estabilished with socket id:-",socket.id)

    socket.on("createdRoomData",(roomData)=>{
        console.log(roomData);
        socket.join(roomData.roomId)
        joinedUser.push(roomData)
        socket.emit("userJoined",{success:true,message:"You joined the room"})
        console.log(joinedUser);
        
    })

    socket.on("roomJoined",(roomData)=>{
        console.log("This is new User joined the room with room is :- ",roomData );
        joinedUser.push(roomData)
        console.log(joinedUser);
        socket.join(roomData.roomId)
    })

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });
    
    socket.on('whiteboardAction', (action) => {
        drawActionData = action
        io.to(action.roomId).emit('whiteboardAction', action);
      });

})


export {io , server}