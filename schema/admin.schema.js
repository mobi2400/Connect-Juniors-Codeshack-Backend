import {z} from "zod";

// Admin Action Schema
const adminActionSchema = z.object({
    actionType: z.enum([
        "approve_mentor",
        "reject_mentor",
        "delete_doubt",
        "delete_answer",
        "delete_comment",
        "ban_user",
        "unban_user",
        "delete_junior_post",
    ]),
    targetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid target ID"),
});

export {adminActionSchema};
