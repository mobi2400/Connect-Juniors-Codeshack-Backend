import express from "express";
import * as userController from "../controllers/user.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
} from "../schema/user.schema.js";

const router = express.Router();

// User authentication
router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);

// Get mentors (needs to be before /:userId to avoid conflicts)
router.get("/mentors/approved", userController.getAllMentors);

// Get users by role
router.get("/role/:role", userController.getUsersByRole);

// User profile
router.get("/:userId", userController.getUserProfile);
router.patch(
    "/:userId",
    validate(updateProfileSchema),
    userController.updateUserProfile
);
router.delete("/:userId", userController.deleteUser);

// Change password
router.post("/:userId/change-password", userController.changePassword);

export default router;
