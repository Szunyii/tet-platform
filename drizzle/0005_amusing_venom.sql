CREATE TABLE `orszagprofil` (
	`id` text PRIMARY KEY NOT NULL,
	`orszag_kod` text NOT NULL,
	`ev` integer NOT NULL,
	`szerzo_id` text,
	`alapadatok` text,
	`kfi_rendszer` text,
	`intezmenyek` text,
	`vallalati` text,
	`programok` text,
	`rendezvenyek` text,
	`kapcsolatok` text,
	`magyar_ertekeles` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`szerzo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orszagprofil_kod_ev_idx` ON `orszagprofil` (`orszag_kod`,`ev`);--> statement-breakpoint
CREATE INDEX `orszagprofil_ev_idx` ON `orszagprofil` (`ev`);