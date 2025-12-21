import express from "express";
import * as answerController from "../controllers/answer.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createAnswerSchema,
    updateAnswerSchema,
} from "../schema/answer.schema.js";

const router = express.Router();

// Filter operations (specific paths before generic ones)
router.get("/helpful/top", answerController.getMostHelpfulAnswers);
router.get("/doubt/:doubtId", answerController.getAnswersByDoubt);
router.get("/mentor/:mentorId", answerController.getAnswersByMentor);

// Answer CRUD operations
router.post(
    "/:doubtId/mentor/:mentorId",
    validate(createAnswerSchema),
    answerController.createAnswer
);
router.get("/:answerId", answerController.getAnswerById);
router.patch(
    "/:answerId",
    validate(updateAnswerSchema),
    answerController.updateAnswer
);
router.delete("/:answerId", answerController.deleteAnswer);

export default router;
