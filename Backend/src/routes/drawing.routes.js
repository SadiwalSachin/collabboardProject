import express from "express";
import Drawing from "../models/drawing.model.js";
import User from "../models/user.model.js";
import { verifyToken } from "../config/firebase.js";

const router = express.Router();

// Save or Update drawing
router.post("/save", verifyToken, async (req, res) => {
    try {
        const { roomId, elements, name, thumbnail } = req.body;
        const { uid, mongoId } = req.user;

        // Find user by mongoId (if it exists) or firebaseId
        const user = mongoId ? await User.findById(mongoId) : await User.findOne({ firebaseId: uid });

        if (!user) return res.status(404).json({ error: "User not found" });

        const drawing = await Drawing.findOneAndUpdate(
            { roomId },
            {
                name: name || "Untitled Board",
                creator: user._id,
                elements,
                thumbnail,
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: "Drawing saved successfully",
            drawing
        });
    } catch (error) {
        console.error("Error saving drawing:", error);
        res.status(500).json({ error: "Failed to save drawing" });
    }
});

// Get all drawings for the logged-in user
router.get("/my-boards", verifyToken, async (req, res) => {
    try {
        const { uid, mongoId } = req.user;
        const user = mongoId ? await User.findById(mongoId) : await User.findOne({ firebaseId: uid });

        if (!user) return res.status(404).json({ error: "User not found" });

        const drawings = await Drawing.find({ creator: user._id })
            .sort({ updatedAt: -1 });

        res.status(200).json(drawings);
    } catch (error) {
        console.error("Error fetching boards:", error);
        res.status(500).json({ error: "Failed to fetch boards" });
    }
});

// Get drawing by roomId
router.get("/room/:roomId", async (req, res) => {
    try {
        const drawing = await Drawing.findOne({ roomId: req.params.roomId })
            .populate("creator", "displayName email")
            .populate("collaborators", "displayName photoURL");

        if (!drawing) return res.status(404).json({ error: "Drawing not found" });

        res.status(200).json(drawing);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch drawing" });
    }
});

export default router;
