CREATE TABLE `scale_cache` (
	`url` text PRIMARY KEY NOT NULL,
	`content` blob NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
