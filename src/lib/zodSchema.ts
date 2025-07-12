import { z } from 'zod';

export const postMetadataSchema = z.object({
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  title: z.string().min(1),
  tags: z.array(z.string()),
  isPrivate: z.boolean(),
  preview: z.string(),
  previewHtml: z.string(),
  reading_time: z.object({
    minutes: z.number(),
    text: z.string(),
    time: z.number(),
    words: z.number(),
  }),
});

export type PostMetadata = z.infer<typeof postMetadataSchema>;