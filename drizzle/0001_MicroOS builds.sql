CREATE TABLE `microos_build_tokens` (
	`token` text PRIMARY KEY NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `microos_builds` (
	`preset` text PRIMARY KEY NOT NULL,
	`kernel` text NOT NULL,
	`symbols` text NOT NULL,
	`initrd` text NOT NULL,
	`iso_url` text NOT NULL,
	`update_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
