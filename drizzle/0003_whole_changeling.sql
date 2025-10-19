CREATE TABLE IF NOT EXISTS "scribbles_account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"scope" text,
	"password" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scribbles_session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "scribbles_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scribbles_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scribbles_user" RENAME COLUMN "username" TO "name";--> statement-breakpoint
ALTER TABLE "scribbles_user" DROP CONSTRAINT "scribbles_user_username_unique";--> statement-breakpoint
ALTER TABLE "scribbles_user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "scribbles_user_link" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "scribbles_user" ADD COLUMN "emailVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scribbles_user" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "scribbles_account" ADD CONSTRAINT "scribbles_account_userId_scribbles_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."scribbles_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scribbles_session" ADD CONSTRAINT "scribbles_session_userId_scribbles_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."scribbles_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scribbles_user" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "scribbles_user" ADD CONSTRAINT "scribbles_user_email_unique" UNIQUE("email");