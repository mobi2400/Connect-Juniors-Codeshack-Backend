import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import {authenticate, requireRole} from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {registerAdminSchema} from "../schema/user.schema.js";

const router = express.Router();

// Admin registration (protected by secret key)
router.post(
    "/register",
    validate(registerAdminSchema),
    adminController.registerAdmin
);

// Admin operations (protected routes)
router.post(
    "/approve-mentor/:mentorId",
    authenticate,
    requireRole("admin"),
    adminController.approveMentor
);
router.post(
    "/reject-mentor/:mentorId",
    authenticate,
    requireRole("admin"),
    adminController.rejectMentor
);
router.delete(
    "/doubt/:doubtId",
    authenticate,
    requireRole("admin"),
    adminController.deleteDoubt
);
router.delete(
    "/answer/:answerId",
    authenticate,
    requireRole("admin"),
    adminController.deleteAnswer
);
router.delete(
    "/comment/:commentId",
    authenticate,
    requireRole("admin"),
    adminController.deleteComment
);
router.delete(
    "/junior-post/:postId",
    authenticate,
    requireRole("admin"),
    adminController.deleteJuniorPost
);
router.post(
    "/ban-user/:userId",
    authenticate,
    requireRole("admin"),
    adminController.banUser
);
router.post(
    "/unban-user/:userId",
    authenticate,
    requireRole("admin"),
    adminController.unbanUser
);
router.get(
    "/actions",
    authenticate,
    requireRole("admin"),
    adminController.getAdminActions
);
router.get(
    "/stats",
    authenticate,
    requireRole("admin"),
    adminController.getAdminStats
);

export default router;
