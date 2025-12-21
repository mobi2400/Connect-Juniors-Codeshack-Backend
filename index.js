import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/connection.js";

// Import routes
import userRoutes from "./routes/user.routes.js";
import doubtRoutes from "./routes/doubt.routes.js";
import answerRoutes from "./routes/answer.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import upvoteRoutes from "./routes/upvote.routes.js";
import mentorProfileRoutes from "./routes/mentorProfile.routes.js";
import juniorSpacePostRoutes from "./routes/juniorSpacePost.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*", // Allow all origins in development, specify in production
    credentials: true, // Allow cookies and authorization headers
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Connect to MongoDB
connectDB();

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CodeShack API is running",
        version: "1.0.0",
    });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upvotes", upvoteRoutes);
app.use("/api/mentor-profiles", mentorProfileRoutes);
app.use("/api/junior-space-posts", juniorSpacePostRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
