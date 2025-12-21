import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import {authenticate, requireRole} from "../middleware/auth.middleware.js";

const router = express.Router();

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
