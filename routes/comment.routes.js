import express from "express";
import * as commentController from "../controllers/comment.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createCommentSchema,
    updateCommentSchema,
} from "../schema/comment.schema.js";

const router = express.Router();

// Comment CRUD operations
router.post(
    "/:doubtId/user/:userId",
    validate(createCommentSchema),
    commentController.createComment
);
router.get("/doubt/:doubtId", commentController.getCommentsByDoubt);
router.get("/:commentId", commentController.getCommentById);
router.patch(
    "/:commentId",
    validate(updateCommentSchema),
    commentController.updateComment
);
router.delete("/:commentId", commentController.deleteComment);

// Reply operations
router.get("/:commentId/replies", commentController.getReplies);

// Filter operations
router.get("/user/:userId", commentController.getCommentsByUser);

export default router;
