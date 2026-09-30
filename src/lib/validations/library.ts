import { z } from "zod";

export const libraryEntrySchema = z.object({
  gameId: z.string().min(1),
  status: z.enum(["PLAYING", "COMPLETED", "BACKLOG", "DROPPED"]),
  progress: z.number().int().min(0).max(100).optional(),
  hoursPlayed: z.number().min(0).optional(),
});

export const profileSchema = z.object({
  name: z.string().max(50).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
});

export type LibraryEntryInput = z.infer<typeof libraryEntrySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
