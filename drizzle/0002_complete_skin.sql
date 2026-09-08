CREATE TABLE `riport` (
	`id` text PRIMARY KEY NOT NULL,
	`szerzo_id` text NOT NULL,
	`orszag` text NOT NULL,
	`kategoria` text NOT NULL,
	`targy` text NOT NULL,
	`leiras` text NOT NULL,
	`kulcsszavak` text NOT NULL,
	`esemeny_datum` text,
	`esemeny_helyszin` text,
	`jo_gyakorlat` text,
	`kapcsolodo_feladat` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`szerzo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `riport_szerzo_idx` ON `riport` (`szerzo_id`);--> statement-breakpoint
CREATE INDEX `riport_kategoria_idx` ON `riport` (`kategoria`);--> statement-breakpoint
CREATE INDEX `riport_created_idx` ON `riport` (`created_at`);--> statement-breakpoint
CREATE TABLE `riport_csatolmany` (
	`id` text PRIMARY KEY NOT NULL,
	`riport_id` text NOT NULL,
	`fajlnev` text NOT NULL,
	`mime` text NOT NULL,
	`meret` integer NOT NULL,
	`tartalom` blob NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`riport_id`) REFERENCES `riport`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `riport_csatolmany_riport_idx` ON `riport_csatolmany` (`riport_id`);