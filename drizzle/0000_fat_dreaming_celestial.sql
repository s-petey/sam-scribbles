CREATE TABLE "scribbles_link" (
	"shortId" varchar(10) PRIMARY KEY NOT NULL,
	"link" text NOT NULL,
	"private" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "scribbles_link_link_unique" UNIQUE("link")
);
--> statement-breakpoint
CREATE TABLE "scribbles_post" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"isPrivate" boolean DEFAULT true NOT NULL,
	"preview" text NOT NULL,
	"previewHtml" text NOT NULL,
	"readingTimeSeconds" integer NOT NULL,
	"readingTimeWords" integer NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "scribbles_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "scribbles_user" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "scribbles_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "scribbles_user_link" (
	"userId" varchar(10) NOT NULL,
	"linkId" varchar(10) NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_user_link" ADD CONSTRAINT "scribbles_user_link_userId_scribbles_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."scribbles_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_user_link" ADD CONSTRAINT "scribbles_user_link_linkId_scribbles_link_shortId_fk" FOREIGN KEY ("linkId") REFERENCES "public"."scribbles_link"("shortId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
