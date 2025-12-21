import express from "express";
import * as answerController from "../controllers/answer.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createAnswerSchema,
    updateAnswerSchema,
} from "../schema/answer.schema.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Filter operations (specific paths before generic ones)
router.get("/helpful/top", authenticate, answerController.getMostHelpfulAnswers);
router.get("/doubt/:doubtId", authenticate, answerController.getAnswersByDoubt);
router.get("/mentor/:mentorId", authenticate, answerController.getAnswersByMentor);

// Answer CRUD operations
router.post(
    "/:doubtId",
    authenticate,
    validate(createAnswerSchema),
    answerController.createAnswer
);
router.get("/:answerId", authenticate, answerController.getAnswerById);
router.patch(
    "/:answerId",
    authenticate,
    validate(updateAnswerSchema),
    answerController.updateAnswer
);
router.delete("/:answerId", authenticate, answerController.deleteAnswer);

export default router;
