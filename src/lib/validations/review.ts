import { z } from "zod";

export const reviewSchema = z.object({
  gameId: z.string().min(1),
  title: z.string().min(3, "Nadpis musí mít alespoň 3 znaky.").max(120),
  content: z.string().min(20, "Recenze musí mít alespoň 20 znaků.").max(5000),
  isSpoiler: z.boolean(),
});

export const ratingSchema = z.object({
  gameId: z.string().min(1),
  value: z.number().int().min(1).max(10),
});

export const commentSchema = z.object({
  reviewId: z.string().min(1),
  content: z.string().min(1, "Komentář nemůže být prázdný.").max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
