import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const SALT_ROUNDS = 10;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

export const register = async (req, res) => {
    try {
        const {name, email, password, role = "junior", bio = ""} = req.body;

        // Validate role
        if (!["junior", "mentor"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be 'junior' or 'mentor'.",
                code: "INVALID_ROLE",
            });
        }

        const existingUser = await User.findOne({email});
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
            role,
            bio,
            isMentorApproved: role === "junior", // Only juniors are auto-approved
        });

        await user.save();

        const token = jwt.sign(
            {userId: user._id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: JWT_EXPIRY}
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                isMentorApproved: user.isMentorApproved,
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
            message: "Error during registration",
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                code: "INVALID_CREDENTIALS",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                code: "INVALID_CREDENTIALS",
            });
        }

        const token = jwt.sign(
            {userId: user._id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: JWT_EXPIRY}
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
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
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message,
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const {userId} = req.params;

        const user = await User.findById(userId).select("-passwordHash");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message,
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const {userId} = req.params;
        const {name, bio} = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};

export const getAllMentors = async (req, res) => {
    try {
        const {page = 1, limit = 10, sortBy = "createdAt"} = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const mentors = await User.find({
            role: "mentor",
            isMentorApproved: true,
        })
            .select("-passwordHash")
            .sort({[sortBy]: -1})
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments({
            role: "mentor",
            isMentorApproved: true,
        });

        res.status(200).json({
            success: true,
            data: mentors,
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
            message: "Error fetching mentors",
            error: error.message,
        });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const {role} = req.params;
        const {page = 1, limit = 10} = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const validRoles = ["junior", "mentor", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
                code: "INVALID_ROLE",
            });
        }

        const users = await User.find({role})
            .select("-passwordHash")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({createdAt: -1});

        const total = await User.countDocuments({role});

        res.status(200).json({
            success: true,
            data: users,
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
            message: "Error fetching users",
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const {userId} = req.params;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: {userId: user._id},
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message,
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const {userId} = req.params;
        const {currentPassword, newPassword} = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
                code: "INVALID_PASSWORD",
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.passwordHash = newPasswordHash;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error changing password",
            error: error.message,
        });
    }
};
