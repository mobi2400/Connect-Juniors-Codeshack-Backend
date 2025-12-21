import express from "express";
import * as upvoteController from "../controllers/upvote.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Upvote operations
// Upvote operations
router.post("/:answerId", authenticate, upvoteController.upvoteAnswer);
router.delete("/:answerId", authenticate, upvoteController.removeUpvote);
router.get("/:answerId", authenticate, upvoteController.getUpvotesByAnswer);
router.get("/user/:userId", authenticate, upvoteController.getUpvotesByUser);
router.get("/:answerId/check/:userId", authenticate, upvoteController.checkIfUpvoted);

export default router;
