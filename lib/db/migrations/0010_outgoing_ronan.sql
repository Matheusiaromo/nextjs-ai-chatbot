CREATE TABLE IF NOT EXISTS "UserApiKey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"provider" varchar NOT NULL,
	"encryptedKey" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "UserApiKey_userId_provider_unique" UNIQUE("userId","provider")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserApiKey" ADD CONSTRAINT "UserApiKey_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
