DROP TABLE `scale_cache`;--> statement-breakpoint
CREATE TABLE `scale_cache` (
	`url` text NOT NULL,
	`tag` text NOT NULL,
	`content` blob NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	PRIMARY KEY(`url`, `tag`)
);