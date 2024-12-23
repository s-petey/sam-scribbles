import { z } from 'zod';

export const routeQueryParams = z.object({
  q: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(25),
});

export type RouteQueryParams = z.infer<typeof routeQueryParams>;
