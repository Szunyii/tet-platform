CREATE TABLE `eredmeny` (
	`id` text PRIMARY KEY NOT NULL,
	`attase_id` text NOT NULL,
	`megnevezes` text NOT NULL,
	`orszag_kod` text NOT NULL,
	`partner` text NOT NULL,
	`magyar_szereplo` text,
	`hozzajarulas` text NOT NULL,
	`leiras` text,
	`szakasz` text NOT NULL,
	`kert_szakasz` text,
	`igazolas` text NOT NULL,
	`allapot` text NOT NULL,
	`kifogas` text,
	`kifogas_szerzo_nev` text,
	`kifogas_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`attase_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "eredmeny_hozzajarulas_check" CHECK("eredmeny"."hozzajarulas" in ('kozvetlen', 'kozremukodes')),
	CONSTRAINT "eredmeny_szakasz_check" CHECK("eredmeny"."szakasz" in ('lehetoseg', 'kapcsolat', 'egyuttmukodes', 'megallapodas')),
	CONSTRAINT "eredmeny_kert_szakasz_check" CHECK("eredmeny"."kert_szakasz" is null or "eredmeny"."kert_szakasz" in ('egyuttmukodes', 'megallapodas')),
	CONSTRAINT "eredmeny_igazolas_check" CHECK("eredmeny"."igazolas" in ('nem_igenyel', 'igazolasra_var', 'igazolt', 'visszakuldott')),
	CONSTRAINT "eredmeny_allapot_check" CHECK("eredmeny"."allapot" in ('aktiv', 'megszakadt'))
);
--> statement-breakpoint
CREATE INDEX `eredmeny_attase_idx` ON `eredmeny` (`attase_id`);--> statement-breakpoint
CREATE TABLE `eredmeny_esemeny` (
	`id` text PRIMARY KEY NOT NULL,
	`eredmeny_id` text NOT NULL,
	`tipus` text NOT NULL,
	`szakasz` text,
	`szoveg` text,
	`link` text,
	`riport_id` text,
	`szerzo_nev` text NOT NULL,
	`szerzo_szerep` text NOT NULL,
	`beszamitasi_ev` integer,
	`beszamitasi_felev` integer,
	`visszavonva` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`eredmeny_id`) REFERENCES `eredmeny`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`riport_id`) REFERENCES `riport`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "eredmeny_esemeny_tipus_check" CHECK("eredmeny_esemeny"."tipus" in ('letrehozas', 'szakaszvaltas', 'igazolas_keres', 'igazolas', 'visszakuldes', 'igazolas_visszavonas', 'megszakitas', 'ujrainditas')),
	CONSTRAINT "eredmeny_esemeny_szakasz_check" CHECK("eredmeny_esemeny"."szakasz" is null or "eredmeny_esemeny"."szakasz" in ('lehetoseg', 'kapcsolat', 'egyuttmukodes', 'megallapodas')),
	CONSTRAINT "eredmeny_esemeny_szerzo_szerep_check" CHECK("eredmeny_esemeny"."szerzo_szerep" in ('admin', 'attase')),
	CONSTRAINT "eredmeny_esemeny_beszamitasi_felev_check" CHECK("eredmeny_esemeny"."beszamitasi_felev" is null or "eredmeny_esemeny"."beszamitasi_felev" in (1, 2))
);
--> statement-breakpoint
CREATE INDEX `eredmeny_esemeny_eredmeny_idx` ON `eredmeny_esemeny` (`eredmeny_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `tevekenyseg` (
	`id` text PRIMARY KEY NOT NULL,
	`attase_id` text NOT NULL,
	`tipus` text NOT NULL,
	`datum` text NOT NULL,
	`orszag_kod` text NOT NULL,
	`megnevezes` text NOT NULL,
	`partner` text NOT NULL,
	`magyar_szereplo` text,
	`leiras` text,
	`riport_id` text,
	`eredmeny_id` text,
	`kifogas` text,
	`kifogas_szerzo_nev` text,
	`kifogas_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`attase_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`riport_id`) REFERENCES `riport`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`eredmeny_id`) REFERENCES `eredmeny`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "tevekenyseg_tipus_check" CHECK("tevekenyseg"."tipus" in ('delegacio', 'b2b', 'partnerkozvetites'))
);
--> statement-breakpoint
CREATE INDEX `tevekenyseg_attase_idx` ON `tevekenyseg` (`attase_id`);--> statement-breakpoint
CREATE INDEX `tevekenyseg_datum_idx` ON `tevekenyseg` (`datum`);--> statement-breakpoint
CREATE INDEX `tevekenyseg_eredmeny_idx` ON `tevekenyseg` (`eredmeny_id`);--> statement-breakpoint
ALTER TABLE `ertekelesi_idoszak` ADD `bovitett_adatok` integer DEFAULT false NOT NULL;