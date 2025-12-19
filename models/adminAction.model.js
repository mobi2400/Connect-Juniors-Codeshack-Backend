import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    actionType: {
        type: String,
        enum: [
            "approve_mentor",
            "reject_mentor",
            "delete_doubt",
            "delete_answer",
            "delete_comment",
            "ban_user",
            "unban_user",
            "delete_junior_post",
        ],
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes
adminActionSchema.index({adminId: 1});
adminActionSchema.index({createdAt: -1});

export default mongoose.model("AdminAction", adminActionSchema);
