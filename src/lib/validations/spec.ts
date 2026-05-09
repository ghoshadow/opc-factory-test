import { z } from "zod";

export const createSpecSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  content: z.string().trim().min(1, "Content is required"),
});

export const updateSpecSchema = createSpecSchema;

export type CreateSpecInput = z.infer<typeof createSpecSchema>;
export type UpdateSpecInput = z.infer<typeof updateSpecSchema>;
