import { z } from 'zod';

const dateSchema = z.string().transform((date) => new Date(date));

export const postMetadataSchema = z.object({
  date: dateSchema,
  updated: dateSchema.optional(),
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
