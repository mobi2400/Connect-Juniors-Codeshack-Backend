import express from "express";
import * as juniorSpacePostController from "../controllers/juniorSpacePost.controller.js";
import validate from "../middleware/validate.middleware.js";
import {
    createPostSchema,
    updatePostSchema,
} from "../schema/juniorSpacePost.schema.js";

const router = express.Router();

// Filter operations (specific paths before generic ones)
router.get("/user/:userId", juniorSpacePostController.getPostsByUser);

// Junior Space Post operations
router.post(
    "/user/:userId",
    validate(createPostSchema),
    juniorSpacePostController.createPost
);
router.get("/", juniorSpacePostController.getAllPosts);
router.get("/:postId", juniorSpacePostController.getPostById);
router.patch(
    "/:postId",
    validate(updatePostSchema),
    juniorSpacePostController.updatePost
);
router.delete("/:postId", juniorSpacePostController.deletePost);

export default router;
