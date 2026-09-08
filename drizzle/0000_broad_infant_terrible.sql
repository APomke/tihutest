CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`model` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`accent` text DEFAULT '#f0523d' NOT NULL,
	`object_key` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`dislikes` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`result_id` text NOT NULL,
	`ip_hash` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`result_id`, `ip_hash`)
);
