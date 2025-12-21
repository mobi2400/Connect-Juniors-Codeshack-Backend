import JuniorSpacePost from "../models/juniorSpacePost.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socket/socket.js";

export const createPost = async (req, res) => {
    try {
        const { userId: juniorId } = req.user;
        const { content } = req.body;

        const user = await User.findById(juniorId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        const post = new JuniorSpacePost({
            content,
            juniorId,
        });

        await post.save();

        const populatedPost = await JuniorSpacePost.findById(post._id).populate(
            "juniorId",
            "name email bio"
        );

        // Emit real-time event
        try {
            const io = getIO();
            io.to("junior-space").emit("new-post", populatedPost);
        } catch (socketError) {
            console.error("Socket.IO error:", socketError.message);
        }

        res.status(201).json({
            success: true,
            message: "Junior space post created successfully",
            data: populatedPost,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating junior space post",
            error: error.message,
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await JuniorSpacePost.find()
            .populate("juniorId", "name email bio")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await JuniorSpacePost.countDocuments();

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching junior space posts",
            error: error.message,
        });
    }
};

export const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await JuniorSpacePost.findById(postId).populate(
            "juniorId",
            "name email bio"
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                code: "POST_NOT_FOUND",
            });
        }

        res.status(200).json({
            success: true,
            data: post,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching junior space post",
            error: error.message,
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        const post = await JuniorSpacePost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                code: "POST_NOT_FOUND",
            });
        }

        if (post.juniorId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post',
                code: 'FORBIDDEN'
            });
        }

        const updatedPost = await JuniorSpacePost.findByIdAndUpdate(
            postId,
            { content },
            { new: true, runValidators: true }
        ).populate("juniorId", "name email bio");

        res.status(200).json({
            success: true,
            message: "Junior space post updated successfully",
            data: updatedPost,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating junior space post",
            error: error.message,
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await JuniorSpacePost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                code: "POST_NOT_FOUND",
            });
        }

        if (post.juniorId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post',
                code: 'FORBIDDEN'
            });
        }

        await JuniorSpacePost.findByIdAndDelete(postId);

        // Emit real-time event
        try {
            const io = getIO();
            io.to("junior-space").emit("post-deleted", { postId });
        } catch (socketError) {
            console.error("Socket.IO error:", socketError.message);
        }

        res.status(200).json({
            success: true,
            message: "Junior space post deleted successfully",
            data: { postId: post._id },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting junior space post",
            error: error.message,
        });
    }
};

export const getPostsByUser = async (req, res) => {
    try {
        const { juniorId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const user = await User.findById(juniorId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        const posts = await JuniorSpacePost.find({ juniorId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await JuniorSpacePost.countDocuments({ juniorId });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user junior space posts",
            error: error.message,
        });
    }
};

export const getRecentPosts = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const recentPosts = await JuniorSpacePost.find()
            .populate("juniorId", "name email bio")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: recentPosts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching recent junior space posts",
            error: error.message,
        });
    }
};

export const getJuniorSpaceStats = async (req, res) => {
    try {
        const totalPosts = await JuniorSpacePost.countDocuments();
        const totalPosters = await JuniorSpacePost.distinct("juniorId");

        const postsPerDay = await JuniorSpacePost.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: -1 } },
            { $limit: 30 },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalPosts,
                totalPosters: totalPosters.length,
                postsPerDay,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching junior space statistics",
            error: error.message,
        });
    }
};
