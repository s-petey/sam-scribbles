ALTER TABLE "scribbles_tags" RENAME TO "scribbles_tag";--> statement-breakpoint
ALTER TABLE "scribbles_links_to_tags" DROP CONSTRAINT "scribbles_links_to_tags_tag_scribbles_tags_name_fk";
--> statement-breakpoint
ALTER TABLE "scribbles_posts_to_tags" DROP CONSTRAINT "scribbles_posts_to_tags_tag_scribbles_tags_name_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_links_to_tags" ADD CONSTRAINT "scribbles_links_to_tags_tag_scribbles_tag_name_fk" FOREIGN KEY ("tag") REFERENCES "public"."scribbles_tag"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scribbles_posts_to_tags" ADD CONSTRAINT "scribbles_posts_to_tags_tag_scribbles_tag_name_fk" FOREIGN KEY ("tag") REFERENCES "public"."scribbles_tag"("name") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
