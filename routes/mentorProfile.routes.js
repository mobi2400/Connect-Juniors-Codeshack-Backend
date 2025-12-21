import express from "express";
import * as mentorProfileController from "../controllers/mentorProfile.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createMentorProfileSchema,
    updateMentorProfileSchema,
} from "../schema/mentorProfile.schema.js";

const router = express.Router();

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
