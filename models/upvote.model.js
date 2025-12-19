import mongoose from "mongoose";

const upvoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    answerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only upvote an answer once
upvoteSchema.index({userId: 1, answerId: 1}, {unique: true});

export default mongoose.model("Upvote", upvoteSchema);
