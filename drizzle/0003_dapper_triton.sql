CREATE TABLE `ticket` (
	`id` text PRIMARY KEY NOT NULL,
	`targy` text NOT NULL,
	`tipus` text NOT NULL,
	`prio` text NOT NULL,
	`hatarido` text,
	`statusz` text NOT NULL,
	`cimzett_id` text NOT NULL,
	`orszag` text NOT NULL,
	`nyito_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`lezarva_at` integer,
	FOREIGN KEY (`cimzett_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`nyito_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `ticket_cimzett_idx` ON `ticket` (`cimzett_id`);--> statement-breakpoint
CREATE INDEX `ticket_statusz_idx` ON `ticket` (`statusz`);--> statement-breakpoint
CREATE INDEX `ticket_updated_idx` ON `ticket` (`updated_at`);--> statement-breakpoint
CREATE TABLE `ticket_olvasas` (
	`ticket_id` text NOT NULL,
	`user_id` text NOT NULL,
	`latott_at` integer NOT NULL,
	PRIMARY KEY(`ticket_id`, `user_id`),
	FOREIGN KEY (`ticket_id`) REFERENCES `ticket`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ticket_uzenet` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`szerzo_id` text,
	`szerzo_nev` text NOT NULL,
	`szerzo_szerep` text NOT NULL,
	`szoveg` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `ticket`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`szerzo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `ticket_uzenet_ticket_idx` ON `ticket_uzenet` (`ticket_id`,`created_at`);