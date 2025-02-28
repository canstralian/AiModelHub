CREATE TABLE "inference_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"model" text NOT NULL,
	"input" text NOT NULL,
	"params" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"response" text,
	"error" text,
	"response_time" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "inference_requests" ADD CONSTRAINT "inference_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;