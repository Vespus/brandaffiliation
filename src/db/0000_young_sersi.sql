-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "characteristics" (
	"id" serial NOT NULL,
	"brand_id" integer NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial NOT NULL,
	"name" text NOT NULL,
	"attribute_price" integer DEFAULT 0,
	"attribute_design" integer,
	"attribute_fame" integer,
	"attribute_product_range" integer,
	"attribute_positioning" integer
);
--> statement-breakpoint
ALTER TABLE "characteristics" ADD CONSTRAINT "fk_brand" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
*/