import { z } from 'zod';

export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});

export const postMetadataSchema = z.object({
  date: isoDatetimeToDate,
  updated: isoDatetimeToDate.optional(),
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
