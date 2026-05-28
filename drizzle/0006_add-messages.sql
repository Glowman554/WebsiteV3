CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`displayname` text NOT NULL,
	`message` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
