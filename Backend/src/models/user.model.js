import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        // unique: true // Removed from here, will use schema-level partial index
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: function () { return !this.firebaseId; } // Required for email users
    },
    displayName: String,
    photoURL: String,
    lastLogin: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

// Partial index: only unique if firebaseId exists and is NOT null
userSchema.index(
    { firebaseId: 1 },
    {
        unique: true,
        partialFilterExpression: { firebaseId: { $exists: true, $ne: null } }
    }
);

const User = mongoose.model("User", userSchema);

export default User;
