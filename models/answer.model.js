import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10000,
    },
    upvoteCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    doubtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doubt",
        required: true,
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
answerSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes
answerSchema.index({doubtId: 1});
answerSchema.index({mentorId: 1});
answerSchema.index({upvoteCount: -1});

export default mongoose.model("Answer", answerSchema);
