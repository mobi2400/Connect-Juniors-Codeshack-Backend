import express from "express";
import * as doubtController from "../controllers/doubt.controller.js";
import validate from "../middleware/validate.middleware.js";
import {createDoubtSchema, updateDoubtSchema} from "../schema/doubt.schema.js";

const router = express.Router();

// Statistics (needs to be before other routes to avoid conflicts)
router.get("/stats/overview", doubtController.getDoubtStats);

// Filter operations (specific paths before generic ones)
router.get("/user/:userId", doubtController.getDoubtsByUser);
router.get("/tag/:tag", doubtController.getDoubtsByTag);

// Doubt CRUD operations
router.post(
    "/user/:userId",
    validate(createDoubtSchema),
    doubtController.createDoubt
);
router.get("/", doubtController.getAllDoubts);
router.get("/:doubtId", doubtController.getDoubtById);
router.patch(
    "/:doubtId",
    validate(updateDoubtSchema),
    doubtController.updateDoubt
);
router.delete("/:doubtId", doubtController.deleteDoubt);

export default router;
