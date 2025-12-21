import AdminAction from "../models/adminAction.model.js";
import User from "../models/user.model.js";
import MentorProfile from "../models/mentorProfile.model.js";
import Doubt from "../models/doubt.model.js";
import Answer from "../models/answer.model.js";
import Comment from "../models/comment.model.js";
import JuniorSpacePost from "../models/juniorSpacePost.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SALT_ROUNDS = 10;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

// Create Admin Account (Protected by Secret Key)
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, bio = "", secretKey } = req.body;

        // Verify secret key
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                message: "Invalid secret key for admin registration",
                code: "INVALID_SECRET_KEY",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
                code: "EMAIL_EXISTS",
            });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = new User({
            name,
            email,
            passwordHash,
            role: "admin",
            bio,
            isMentorApproved: true, // Admins don't need approval
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
            },
            token,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already in use",
                code: "DUPLICATE_EMAIL",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error during admin registration",
            error: error.message,
        });
    }
};

export const approveMentor = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { mentorId } = req.params; // Get mentor ID from URL params

        const mentorProfile = await MentorProfile.findOne({
            userId: mentorId,
        });

        // If profile exists, approve it. If not, proceed to approve user anyway.
        if (mentorProfile) {
            mentorProfile.approvedByAdmin = true;
            await mentorProfile.save();
        }

        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        mentor.isMentorApproved = true;
        await mentor.save();

        const adminAction = new AdminAction({
            adminId,
            actionType: "approve_mentor",
            targetId: mentorId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "Mentor approved successfully",
            data: {
                mentorId: mentorId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error approving mentor",
            error: error.message,
        });
    }
};

export const rejectMentor = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { mentorId } = req.params; // Get mentor ID from URL params

        const mentorProfile = await MentorProfile.findOneAndDelete({
            userId: mentorId,
        });
        if (!mentorProfile) {
            return res.status(404).json({
                success: false,
                message: "Mentor profile not found",
                code: "PROFILE_NOT_FOUND",
            });
        }

        const adminAction = new AdminAction({
            adminId,
            actionType: "reject_mentor",
            targetId: mentorId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "Mentor rejected and profile deleted",
            data: {
                mentorId: mentorId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error rejecting mentor",
            error: error.message,
        });
    }
};

export const deleteDoubt = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { doubtId } = req.params; // Get doubt ID from URL params

        const doubt = await Doubt.findByIdAndDelete(doubtId);
        if (!doubt) {
            return res.status(404).json({
                success: false,
                message: "Doubt not found",
                code: "DOUBT_NOT_FOUND",
            });
        }

        await Answer.deleteMany({ doubtId });
        await Comment.deleteMany({ doubtId });

        const adminAction = new AdminAction({
            adminId,
            actionType: "delete_doubt",
            targetId: doubtId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "Doubt deleted successfully",
            data: {
                doubtId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting doubt",
            error: error.message,
        });
    }
};

export const deleteAnswer = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { answerId } = req.params; // Get answer ID from URL params

        const answer = await Answer.findByIdAndDelete(answerId);
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: "Answer not found",
                code: "ANSWER_NOT_FOUND",
            });
        }

        const adminAction = new AdminAction({
            adminId,
            actionType: "delete_answer",
            targetId: answerId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "Answer deleted successfully",
            data: {
                answerId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting answer",
            error: error.message,
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { commentId } = req.params; // Get comment ID from URL params

        const comment = await Comment.findByIdAndDelete(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
                code: "COMMENT_NOT_FOUND",
            });
        }

        await Comment.deleteMany({ parentCommentId: commentId });

        const adminAction = new AdminAction({
            adminId,
            actionType: "delete_comment",
            targetId: commentId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
            data: {
                commentId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: error.message,
        });
    }
};

export const deleteJuniorPost = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { postId } = req.params; // Get post ID from URL params

        const post = await JuniorSpacePost.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                code: "POST_NOT_FOUND",
            });
        }

        const adminAction = new AdminAction({
            adminId,
            actionType: "delete_junior_post",
            targetId: postId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "Junior space post deleted successfully",
            data: {
                postId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting junior post",
            error: error.message,
        });
    }
};

export const banUser = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { userId } = req.params; // Get user ID from URL params

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        const adminAction = new AdminAction({
            adminId,
            actionType: "ban_user",
            targetId: userId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "User banned successfully",
            data: {
                userId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error banning user",
            error: error.message,
        });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { userId } = req.params; // Get user ID from URL params

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        const adminAction = new AdminAction({
            adminId,
            actionType: "unban_user",
            targetId: userId,
        });

        await adminAction.save();

        res.status(200).json({
            success: true,
            message: "User unbanned successfully",
            data: {
                userId,
                actionId: adminAction._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error unbanning user",
            error: error.message,
        });
    }
};

export const getAdminActions = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token
        const { page = 1, limit = 20, actionType } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { adminId };
        if (actionType) filter.actionType = actionType;

        const actions = await AdminAction.find(filter)
            .populate("adminId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await AdminAction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: actions,
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
            message: "Error fetching admin actions",
            error: error.message,
        });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const adminId = req.user.userId; // Get admin ID from JWT token

        const totalActions = await AdminAction.countDocuments({ adminId });
        const actionBreakdown = await AdminAction.aggregate([
            { $match: { adminId: new mongoose.Types.ObjectId(adminId) } }, // Convert to ObjectId for aggregation
            { $group: { _id: "$actionType", count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalActions,
                actionBreakdown,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching admin statistics",
            error: error.message,
        });
    }
};
