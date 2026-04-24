ALTER TABLE "participants" ADD COLUMN "wpm" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "races" ADD COLUMN "start_at" timestamp;