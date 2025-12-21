import express from "express";
import * as mentorProfileController from "../controllers/mentorProfile.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createMentorProfileSchema,
    updateMentorProfileSchema,
} from "../schema/mentorProfile.schema.js";
import {registerMentorSchema} from "../schema/user.schema.js";

const router = express.Router();

// Mentor registration (protected by secret key)
router.post(
    "/register",
    validate(registerMentorSchema),
    mentorProfileController.registerMentor
);

// List operations (specific routes first)
router.get("/approved/all", mentorProfileController.getAllApprovedMentors);
router.get("/pending/all", mentorProfileController.getPendingMentorApprovals);
router.get("/top/list", mentorProfileController.getTopMentors);
router.get("/expertise/:tag", mentorProfileController.getMentorsByExpertise);

// Mentor Profile operations
router.post(
    "/:mentorId",
    validate(createMentorProfileSchema),
    mentorProfileController.createMentorProfile
);
router.get("/:mentorId", mentorProfileController.getMentorProfile);
router.patch(
    "/:mentorId",
    validate(updateMentorProfileSchema),
    mentorProfileController.updateMentorProfile
);
router.delete("/:mentorId", mentorProfileController.deleteMentorProfile);

export default router;
