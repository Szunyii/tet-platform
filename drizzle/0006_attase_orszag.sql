CREATE TABLE `attase_orszag` (
	`user_id` text NOT NULL,
	`orszag_kod` text NOT NULL,
	`szekhely` integer DEFAULT false NOT NULL,
	`vezeto` integer DEFAULT false NOT NULL,
	`varos` text,
	`reszterulet` text,
	PRIMARY KEY(`user_id`, `orszag_kod`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attase_orszag_vezeto_idx` ON `attase_orszag` (`orszag_kod`) WHERE "attase_orszag"."vezeto" = 1;--> statement-breakpoint
CREATE UNIQUE INDEX `attase_orszag_szekhely_idx` ON `attase_orszag` (`user_id`) WHERE "attase_orszag"."szekhely" = 1;--> statement-breakpoint
CREATE INDEX `attase_orszag_orszag_idx` ON `attase_orszag` (`orszag_kod`);--> statement-breakpoint
-- Adat (kézzel hozzáadva): a régi user.orszag → székhely-sor (szóközök levágva); adminnak nincs sora.
INSERT INTO `attase_orszag` (`user_id`, `orszag_kod`, `szekhely`, `vezeto`)
SELECT `id`, trim(`orszag`), 1, 0 FROM `user`
WHERE trim(coalesce(`orszag`, '')) <> '' AND coalesce(`role`, 'attase') <> 'admin';--> statement-breakpoint
-- Országonként egy relációs vezető: a nem tiltott attasék közül név szerint az első (a térkép
-- eddigi „első attaséja”); ha mind tiltott, a név szerint első. Tiltott = banned és a ban_expires
-- hiányzik vagy a jövőben van (lib/felhasznalo-tiltas.ts).
UPDATE `attase_orszag` SET `vezeto` = 1
WHERE `user_id` = (
  SELECT `ao`.`user_id` FROM `attase_orszag` AS `ao`
  JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
  WHERE `ao`.`orszag_kod` = `attase_orszag`.`orszag_kod`
  ORDER BY (coalesce(`u`.`banned`, 0) = 1
    AND (`u`.`ban_expires` IS NULL OR `u`.`ban_expires` > cast(unixepoch('subsecond') * 1000 as integer))),
    `u`.`name`, `u`.`id`
  LIMIT 1
);--> statement-breakpoint
-- A poszt-adatok (főváros, terület, pénznem) az ország minden meglévő Alapadatok blokkjába, ahol a kulcs
-- még hiányzik vagy üres: mezőnként az ország attaséi közül az első nem üres érték (a vezető előnyben,
-- utána név szerint). Ahol nincs mentett Alapadatok blokk, az érték elvész (profil-sort nem hozunk létre:
-- hamis „Adott évi profil” állapotot mutatna). Hibás JSON-t nem érint; az updated_at szándékosan nem változik.
UPDATE `orszagprofil` SET `alapadatok` = json_set(`alapadatok`,
  '$.fovaros', coalesce(nullif(json_extract(`alapadatok`, '$.fovaros'), ''), (
    SELECT `u`.`fovaros` FROM `attase_orszag` AS `ao` JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
    WHERE `ao`.`orszag_kod` = `orszagprofil`.`orszag_kod` AND coalesce(`u`.`fovaros`, '') <> ''
    ORDER BY `ao`.`vezeto` DESC, `u`.`name`, `u`.`id` LIMIT 1)),
  '$.terulet', coalesce(json_extract(`alapadatok`, '$.terulet'), (
    SELECT `u`.`terulet` FROM `attase_orszag` AS `ao` JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
    WHERE `ao`.`orszag_kod` = `orszagprofil`.`orszag_kod` AND `u`.`terulet` IS NOT NULL
    ORDER BY `ao`.`vezeto` DESC, `u`.`name`, `u`.`id` LIMIT 1)),
  '$.penznem', coalesce(nullif(json_extract(`alapadatok`, '$.penznem'), ''), (
    SELECT `u`.`penznem` FROM `attase_orszag` AS `ao` JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
    WHERE `ao`.`orszag_kod` = `orszagprofil`.`orszag_kod` AND coalesce(`u`.`penznem`, '') <> ''
    ORDER BY `ao`.`vezeto` DESC, `u`.`name`, `u`.`id` LIMIT 1)))
WHERE `alapadatok` IS NOT NULL AND json_valid(`alapadatok`) AND EXISTS (
  SELECT 1 FROM `attase_orszag` AS `ao` JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
  WHERE `ao`.`orszag_kod` = `orszagprofil`.`orszag_kod`
    AND (coalesce(`u`.`fovaros`, '') <> '' OR `u`.`terulet` IS NOT NULL OR coalesce(`u`.`penznem`, '') <> ''));
