import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized");
    } catch (error) {
        console.error("Firebase Admin Init Error:", error.message);
    }
}

// Verify token can now handle both Firebase ID Tokens and our custom JWTs
export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        // 1. Try Firebase Token first
        let decodedFirebase = null;
        try {
            decodedFirebase = await admin.auth().verifyIdToken(token);
        } catch (err) {
            // Not a firebase token, will try JWT next
        }

        if (decodedFirebase) {
            req.user = decodedFirebase;
            return next();
        }

        // 2. Try our custom JWT
        const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedJWT) {
            const user = await User.findById(decodedJWT.id);
            if (!user) throw new Error("User not found");

            // Map custom user to a similar structure as Firebase for compatibility
            req.user = {
                uid: user.firebaseId || user._id.toString(),
                email: user.email,
                name: user.displayName,
                mongoId: user._id
            };
            return next();
        }

        throw new Error("Invalid token format");
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ error: "Unauthorized access" });
    }
};
