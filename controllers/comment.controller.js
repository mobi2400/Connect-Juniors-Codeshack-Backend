import Comment from "../models/comment.model.js";
import Doubt from "../models/doubt.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socket/socket.js";

export const createComment = async (req, res) => {
    try {
        const { doubtId } = req.params;
        const { userId } = req.user;
        const { content, parentCommentId } = req.body;

        const doubt = await Doubt.findById(doubtId);
        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: "Doubt not found",
                code: "DOUBT_NOT_FOUND",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: "Parent comment not found",
                    code: "PARENT_COMMENT_NOT_FOUND",
                });
            }
        }

        const comment = new Comment({
            content,
            doubtId,
            userId,
            parentCommentId: parentCommentId || null,
        });

        await comment.save();

        const populatedComment = await Comment.findById(comment._id).populate(
            "userId",
            "name email"
        );

        // Emit real-time event
        try {
            const io = getIO();
            io.to(`doubt-${doubtId}`).emit("new-comment", populatedComment);
        } catch (socketError) {
            console.error("Socket.IO error:", socketError.message);
        }

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: populatedComment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating comment",
            error: error.message,
        });
    }
};

export const getCommentsByDoubt = async (req, res) => {
    try {
        const { doubtId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const doubt = await Doubt.findById(doubtId);
        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: "Doubt not found",
                code: "DOUBT_NOT_FOUND",
            });
        }

        const comments = await Comment.find({ doubtId, parentCommentId: null })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        for (let comment of comments) {
            const replies = await Comment.find({ parentCommentId: comment._id })
                .populate("userId", "name email")
                .sort({ createdAt: 1 })
                .lean();
            comment.replies = replies;
        }

        const total = await Comment.countDocuments({
            doubtId,
            parentCommentId: null,
        });

        res.status(200).json({
            success: true,
            data: comments,
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
            message: "Error fetching comments",
            error: error.message,
        });
    }
};

export const getCommentById = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId)
            .populate("userId", "name email")
            .populate("parentCommentId");

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
                code: "COMMENT_NOT_FOUND",
            });
        }

        const replies = await Comment.find({ parentCommentId: commentId })
            .populate("userId", "name email")
            .sort({ createdAt: 1 })
            .lean();

        comment.replies = replies;

        res.status(200).json({
            success: true,
            data: comment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching comment",
            error: error.message,
        });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
                code: "COMMENT_NOT_FOUND",
            });
        }

        if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment',
                code: 'FORBIDDEN'
            });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true, runValidators: true }
        ).populate("userId", "name email");

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: updatedComment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating comment",
            error: error.message,
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
                code: "COMMENT_NOT_FOUND",
            });
        }

        if (comment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment',
                code: 'FORBIDDEN'
            });
        }

        const doubtId = comment.doubtId;

        await Comment.deleteMany({ parentCommentId: commentId });
        await Comment.deleteOne({ _id: commentId });

        // Emit real-time event
        try {
            const io = getIO();
            io.to(`doubt-${doubtId}`).emit("comment-deleted", { commentId });
        } catch (socketError) {
            console.error("Socket.IO error:", socketError.message);
        }

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
            data: { commentId: comment._id },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: error.message,
        });
    }
};

export const getReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
                code: "COMMENT_NOT_FOUND",
            });
        }

        const replies = await Comment.find({ parentCommentId: commentId })
            .populate("userId", "name email")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Comment.countDocuments({
            parentCommentId: commentId,
        });

        res.status(200).json({
            success: true,
            data: replies,
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
            message: "Error fetching replies",
            error: error.message,
        });
    }
};

export const getCommentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        const comments = await Comment.find({ userId })
            .populate("doubtId", "title")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Comment.countDocuments({ userId });

        res.status(200).json({
            success: true,
            data: comments,
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
            message: "Error fetching user comments",
            error: error.message,
        });
    }
};
