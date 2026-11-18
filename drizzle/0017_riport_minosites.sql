CREATE TABLE `riport_minosites` (
	`riport_id` text PRIMARY KEY NOT NULL,
	`fokozat` integer NOT NULL,
	`megjegyzes` text,
	`szerzo_nev` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`riport_id`) REFERENCES `riport`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "riport_minosites_fokozat_check" CHECK("riport_minosites"."fokozat" between 1 and 4)
);
