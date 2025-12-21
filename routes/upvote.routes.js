import express from "express";
import * as upvoteController from "../controllers/upvote.controller.js";

const router = express.Router();

// Upvote operations
router.post("/:answerId", upvoteController.upvoteAnswer);
router.delete("/:answerId", upvoteController.removeUpvote);
router.get("/:answerId", upvoteController.getUpvotesByAnswer);
router.get("/user/:userId", upvoteController.getUpvotesByUser);
router.get("/:answerId/check/:userId", upvoteController.checkIfUpvoted);

export default router;
