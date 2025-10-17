CREATE TABLE "scribbles_links_to_tags" (
	"linkId" varchar(10) NOT NULL,
	"tag" text NOT NULL,
	CONSTRAINT "scribbles_links_to_tags_linkId_tag_pk" PRIMARY KEY("linkId","tag")
);
--> statement-breakpoint
CREATE TABLE "scribbles_posts_to_tags" (
	"postId" varchar(10) NOT NULL,
	"tag" text NOT NULL,
	CONSTRAINT "scribbles_posts_to_tags_postId_tag_pk" PRIMARY KEY("postId","tag")
);
--> statement-breakpoint
CREATE TABLE "scribbles_tags" (
	"name" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_links_to_tags" ADD CONSTRAINT "scribbles_links_to_tags_linkId_scribbles_link_shortId_fk" FOREIGN KEY ("linkId") REFERENCES "public"."scribbles_link"("shortId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_links_to_tags" ADD CONSTRAINT "scribbles_links_to_tags_tag_scribbles_tags_name_fk" FOREIGN KEY ("tag") REFERENCES "public"."scribbles_tags"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_posts_to_tags" ADD CONSTRAINT "scribbles_posts_to_tags_postId_scribbles_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."scribbles_post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_posts_to_tags" ADD CONSTRAINT "scribbles_posts_to_tags_tag_scribbles_tags_name_fk" FOREIGN KEY ("tag") REFERENCES "public"."scribbles_tags"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
