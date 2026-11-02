CREATE TABLE `tudastar_kartya` (
	`id` text PRIMARY KEY NOT NULL,
	`kategoria` text NOT NULL,
	`slug` text NOT NULL,
	`tipus` text NOT NULL,
	`nev` text NOT NULL,
	`rovidites` text,
	`osszefoglalo` text NOT NULL,
	`honlap` text,
	`sorrend` integer NOT NULL,
	`tartalom` text NOT NULL,
	`szerzo_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`szerzo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tudastar_kartya_slug_idx` ON `tudastar_kartya` (`slug`);--> statement-breakpoint
CREATE INDEX `tudastar_kartya_kategoria_idx` ON `tudastar_kartya` (`kategoria`,`sorrend`);