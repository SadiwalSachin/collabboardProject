import mongoose from "mongoose";

const drawingSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: "Untitled Board"
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    elements: {
        type: Array, // Stores the JSON representation of Konva elements
        default: []
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    thumbnail: String
}, { timestamps: true });

const Drawing = mongoose.model("Drawing", drawingSchema);
export default Drawing;
