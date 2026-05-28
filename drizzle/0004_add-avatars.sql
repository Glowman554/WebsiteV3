CREATE TABLE `avatars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`model_url` text NOT NULL,
	`configuration` text NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
