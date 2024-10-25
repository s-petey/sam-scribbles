CREATE TABLE IF NOT EXISTS "scribbles_post" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"imageUrl" text,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scribbles_user" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
