import express from "express";
import * as commentController from "../controllers/comment.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createCommentSchema,
    updateCommentSchema,
} from "../schema/comment.schema.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Comment CRUD operations
// Comment CRUD operations
router.post(
    "/:doubtId",
    authenticate,
    validate(createCommentSchema),
    commentController.createComment
);
router.get("/doubt/:doubtId", authenticate, commentController.getCommentsByDoubt);
router.get("/:commentId", authenticate, commentController.getCommentById);
router.patch(
    "/:commentId",
    authenticate,
    validate(updateCommentSchema),
    commentController.updateComment
);
router.delete("/:commentId", authenticate, commentController.deleteComment);

// Reply operations
router.get("/:commentId/replies", authenticate, commentController.getReplies);

// Filter operations
router.get("/user/:userId", authenticate, commentController.getCommentsByUser);

export default router;
