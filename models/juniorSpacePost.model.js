import mongoose from "mongoose";

const juniorSpacePostSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000,
    },
    juniorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes
juniorSpacePostSchema.index({juniorId: 1});
juniorSpacePostSchema.index({createdAt: -1});

export default mongoose.model("JuniorSpacePost", juniorSpacePostSchema);
