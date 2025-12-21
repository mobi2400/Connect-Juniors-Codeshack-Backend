import { z } from "zod";

// User Registration Schema (Junior only)
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    bio: z.string().max(500).optional(),
    role: z.enum(["junior", "mentor"]).optional(),
});

// Mentor Registration Schema (Requires Secret Key)
const registerMentorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    bio: z.string().max(500).optional(),
    secretKey: z.string().min(1, "Secret key is required"),
});

// Admin Registration Schema (Requires Secret Key)
const registerAdminSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    bio: z.string().max(500).optional(),
    secretKey: z.string().min(1, "Secret key is required"),
});

// User Login Schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// Update User Profile Schema
const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
});

export {
    registerSchema,
    registerMentorSchema,
    registerAdminSchema,
    loginSchema,
    updateProfileSchema,
};
