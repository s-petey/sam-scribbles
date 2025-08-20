ALTER TABLE "scribbles_account" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "scribbles_post" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "scribbles_session" ALTER COLUMN "createdAt" SET DEFAULT now();