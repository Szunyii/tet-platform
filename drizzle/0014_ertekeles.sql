CREATE TABLE `attase_ertekeles` (
	`id` text PRIMARY KEY NOT NULL,
	`idoszak_id` text NOT NULL,
	`attase_id` text NOT NULL,
	`attase_nev` text NOT NULL,
	`szekhely_kod` text NOT NULL,
	`varos` text,
	`orszagok` text NOT NULL,
	`kimarad` integer DEFAULT false NOT NULL,
	`kimaradas_oka` text,
	`ossz_fokozat` integer,
	`ossz_indoklas` text,
	`fejlesztesi_cel` text,
	`ertekelo_nev` text,
	`minositve_at` integer,
	`mutatok` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`idoszak_id`) REFERENCES `ertekelesi_idoszak`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "attase_ertekeles_ossz_fokozat_check" CHECK("attase_ertekeles"."ossz_fokozat" is null or "attase_ertekeles"."ossz_fokozat" between 1 and 4),
	CONSTRAINT "attase_ertekeles_orszagok_check" CHECK(json_valid("attase_ertekeles"."orszagok")),
	CONSTRAINT "attase_ertekeles_mutatok_check" CHECK("attase_ertekeles"."mutatok" is null or json_valid("attase_ertekeles"."mutatok"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attase_ertekeles_idoszak_attase_idx` ON `attase_ertekeles` (`idoszak_id`,`attase_id`);--> statement-breakpoint
CREATE TABLE `ertekelesi_idoszak` (
	`id` text PRIMARY KEY NOT NULL,
	`ev` integer NOT NULL,
	`felev` integer NOT NULL,
	`statusz` text NOT NULL,
	`lezarva_at` integer,
	`lezarta_nev` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "ertekelesi_idoszak_felev_check" CHECK("ertekelesi_idoszak"."felev" in (1, 2)),
	CONSTRAINT "ertekelesi_idoszak_statusz_check" CHECK("ertekelesi_idoszak"."statusz" in ('nyitott', 'lezart'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ertekelesi_idoszak_ev_felev_idx` ON `ertekelesi_idoszak` (`ev`,`felev`);--> statement-breakpoint
CREATE TABLE `szempont_minosites` (
	`ertekeles_id` text NOT NULL,
	`szempont` text NOT NULL,
	`fokozat` integer NOT NULL,
	`indoklas` text,
	`ertekelo_nev` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`ertekeles_id`, `szempont`),
	FOREIGN KEY (`ertekeles_id`) REFERENCES `attase_ertekeles`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "szempont_minosites_fokozat_check" CHECK("szempont_minosites"."fokozat" between 0 and 4)
);
