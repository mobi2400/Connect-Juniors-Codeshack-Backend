import express from "express";
import * as doubtController from "../controllers/doubt.controller.js";
import validate from "../middleware/validate.middleware.js";
import { createDoubtSchema, updateDoubtSchema } from "../schema/doubt.schema.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Statistics (needs to be before other routes to avoid conflicts)
router.get("/stats/overview", doubtController.getDoubtStats);

// Filter operations (specific paths before generic ones)
router.get("/user/:userId", authenticate, doubtController.getDoubtsByUser);
router.get("/tag/:tag", authenticate, doubtController.getDoubtsByTag);

// Doubt CRUD operations
router.post(
    "/",
    authenticate,
    validate(createDoubtSchema),
    doubtController.createDoubt
);
router.get("/", authenticate, doubtController.getAllDoubts);
router.get("/:doubtId", authenticate, doubtController.getDoubtById);
router.patch(
    "/:doubtId",
    authenticate,
    validate(updateDoubtSchema),
    doubtController.updateDoubt
);
router.delete("/:doubtId", authenticate, doubtController.deleteDoubt);

export default router;
