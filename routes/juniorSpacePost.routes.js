import express from "express";
import * as juniorSpacePostController from "../controllers/juniorSpacePost.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createPostSchema,
    updatePostSchema,
} from "../schema/juniorSpacePost.schema.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Filter operations (specific paths before generic ones)
router.get("/user/:userId", authenticate, juniorSpacePostController.getPostsByUser);

// Junior Space Post operations
router.post(
    "/",
    authenticate,
    validate(createPostSchema),
    juniorSpacePostController.createPost
);
router.get("/", authenticate, juniorSpacePostController.getAllPosts);
router.get("/:postId", authenticate, juniorSpacePostController.getPostById);
router.patch(
    "/:postId",
    authenticate,
    validate(updatePostSchema),
    juniorSpacePostController.updatePost
);
router.delete("/:postId", authenticate, juniorSpacePostController.deletePost);

export default router;
