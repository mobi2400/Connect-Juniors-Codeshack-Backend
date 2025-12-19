import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    badge: {
        type: String,
        default: "Mentor",
        trim: true,
    },
    expertiseTags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    totalUpvotes: {
        type: Number,
        default: 0,
        min: 0,
    },
    approvedByAdmin: {
        type: Boolean,
        default: false,
    },
});

export default mongoose.model("MentorProfile", mentorProfileSchema);
