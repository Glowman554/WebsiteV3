CREATE TABLE `downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`link` text NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`link` text NOT NULL,
	`description` text NOT NULL,
	`creation_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`username` text NOT NULL,
	`token` text PRIMARY KEY NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`administrator` integer DEFAULT false NOT NULL,
	`passwordHash` text NOT NULL
);
