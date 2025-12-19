import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    tags: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    status: {
        type: String,
        enum: ["open", "answered", "resolved", "closed"],
        default: "open",
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
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
doubtSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for faster queries
doubtSchema.index({juniorId: 1});
doubtSchema.index({status: 1});
doubtSchema.index({tags: 1});
doubtSchema.index({createdAt: -1});

export default mongoose.model("Doubt", doubtSchema);
