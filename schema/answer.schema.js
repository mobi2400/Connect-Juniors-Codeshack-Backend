import { z } from "zod";

// Create Answer Schema
const createAnswerSchema = z.object({
    content: z
        .string()
        .min(20, "Answer must be at least 20 characters")
        .max(10000),
});

// Update Answer Schema
const updateAnswerSchema = z.object({
    content: z.string().min(20).max(10000),
});

export { createAnswerSchema, updateAnswerSchema };
