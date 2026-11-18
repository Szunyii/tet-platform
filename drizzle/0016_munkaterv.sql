CREATE TABLE `kozponti_cel` (
	`id` text PRIMARY KEY NOT NULL,
	`ev` integer NOT NULL,
	`megnevezes` text NOT NULL,
	`szempont` text NOT NULL,
	`merce` text NOT NULL,
	`hatokor` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "kozponti_cel_szempont_check" CHECK("kozponti_cel"."szempont" in ('tajekoztatas', 'orszagismeret', 'kapcsolatepites', 'eredmenyek', 'egyuttmukodes')),
	CONSTRAINT "kozponti_cel_hatokor_check" CHECK("kozponti_cel"."hatokor" in ('halozat', 'europa', 'azsia', 'kozelKelet', 'afrika', 'amerika'))
);
--> statement-breakpoint
CREATE INDEX `kozponti_cel_ev_idx` ON `kozponti_cel` (`ev`);--> statement-breakpoint
CREATE TABLE `munkaterv` (
	`id` text PRIMARY KEY NOT NULL,
	`attase_id` text NOT NULL,
	`ev` integer NOT NULL,
	`statusz` text NOT NULL,
	`megjegyzes` text,
	`modositasi_kerelem` text,
	`jovahagyta_nev` text,
	`jovahagyva_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`attase_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "munkaterv_statusz_check" CHECK("munkaterv"."statusz" in ('piszkozat', 'jovahagyasra_var', 'visszakuldott', 'jovahagyott'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `munkaterv_attase_ev_idx` ON `munkaterv` (`attase_id`,`ev`);--> statement-breakpoint
CREATE INDEX `munkaterv_ev_idx` ON `munkaterv` (`ev`);--> statement-breakpoint
CREATE TABLE `munkaterv_cel` (
	`id` text PRIMARY KEY NOT NULL,
	`terv_id` text NOT NULL,
	`kozponti_cel_id` text,
	`sorrend` integer NOT NULL,
	`megnevezes` text NOT NULL,
	`orszag_kod` text NOT NULL,
	`szempont` text NOT NULL,
	`merce` text NOT NULL,
	`allapot` text DEFAULT 'folyamatban' NOT NULL,
	`allapot_megjegyzes` text,
	`allapot_modositotta_nev` text,
	`allapot_modositva_at` integer,
	`allapot_felulirva` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`terv_id`) REFERENCES `munkaterv`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`kozponti_cel_id`) REFERENCES `kozponti_cel`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "munkaterv_cel_szempont_check" CHECK("munkaterv_cel"."szempont" in ('tajekoztatas', 'orszagismeret', 'kapcsolatepites', 'eredmenyek', 'egyuttmukodes')),
	CONSTRAINT "munkaterv_cel_allapot_check" CHECK("munkaterv_cel"."allapot" in ('folyamatban', 'teljesult', 'reszben', 'elmaradt'))
);
--> statement-breakpoint
CREATE INDEX `munkaterv_cel_terv_sorrend_idx` ON `munkaterv_cel` (`terv_id`,`sorrend`);--> statement-breakpoint
CREATE INDEX `munkaterv_cel_kozponti_cel_idx` ON `munkaterv_cel` (`kozponti_cel_id`);--> statement-breakpoint
CREATE TABLE `munkaterv_ev` (
	`ev` integer PRIMARY KEY NOT NULL,
	`kozzeteve_at` integer NOT NULL,
	`kozzetette_nev` text NOT NULL
);
