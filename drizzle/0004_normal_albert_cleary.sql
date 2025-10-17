CREATE TABLE "scribbles_posts_to_related_posts" (
	"postId" varchar(10) NOT NULL,
	"relatedPostId" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "postIdRelatedPostIdIndex" PRIMARY KEY("postId","relatedPostId")
);
--> statement-breakpoint
ALTER TABLE "scribbles_links_to_tags" DROP CONSTRAINT "scribbles_links_to_tags_linkId_tag_pk";--> statement-breakpoint
ALTER TABLE "scribbles_posts_to_tags" DROP CONSTRAINT "scribbles_posts_to_tags_postId_tag_pk";--> statement-breakpoint
ALTER TABLE "scribbles_account" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "scribbles_post" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "scribbles_session" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "scribbles_links_to_tags" ADD CONSTRAINT "linkIdTagIndex" PRIMARY KEY("linkId","tag");--> statement-breakpoint
ALTER TABLE "scribbles_posts_to_tags" ADD CONSTRAINT "postIdTagIndex" PRIMARY KEY("postId","tag");--> statement-breakpoint
ALTER TABLE "scribbles_posts_to_related_posts" ADD CONSTRAINT "scribbles_posts_to_related_posts_postId_scribbles_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."scribbles_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scribbles_posts_to_related_posts" ADD CONSTRAINT "scribbles_posts_to_related_posts_relatedPostId_scribbles_post_id_fk" FOREIGN KEY ("relatedPostId") REFERENCES "public"."scribbles_post"("id") ON DELETE cascade ON UPDATE no action;