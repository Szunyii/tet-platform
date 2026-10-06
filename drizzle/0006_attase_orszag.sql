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
-- Adat (kézzel hozzáadva): a régi user.orszag → székhely-sor; adminnak nincs sora.
INSERT INTO `attase_orszag` (`user_id`, `orszag_kod`, `szekhely`, `vezeto`)
SELECT `id`, `orszag`, 1, 0 FROM `user`
WHERE `orszag` IS NOT NULL AND `orszag` <> '' AND coalesce(`role`, 'attase') <> 'admin';--> statement-breakpoint
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
    `u`.`name`
  LIMIT 1
);--> statement-breakpoint
-- A vezető poszt-adatai (főváros, terület, pénznem) az ország minden meglévő Alapadatok blokkjába,
-- ahol a kulcs még hiányzik vagy üres. Ahol nincs mentett Alapadatok blokk, az érték elvész (profil-sort
-- nem hozunk létre: hamis „Adott évi profil” állapotot mutatna). Az updated_at szándékosan nem változik.
UPDATE `orszagprofil` SET `alapadatok` = json_set(`orszagprofil`.`alapadatok`,
  '$.fovaros', coalesce(nullif(json_extract(`orszagprofil`.`alapadatok`, '$.fovaros'), ''), `v`.`fovaros`),
  '$.terulet', coalesce(json_extract(`orszagprofil`.`alapadatok`, '$.terulet'), `v`.`terulet`),
  '$.penznem', coalesce(nullif(json_extract(`orszagprofil`.`alapadatok`, '$.penznem'), ''), `v`.`penznem`))
FROM (
  SELECT `ao`.`orszag_kod` AS `kod`, `u`.`fovaros`, `u`.`terulet`, `u`.`penznem`
  FROM `attase_orszag` AS `ao` JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
  WHERE `ao`.`vezeto` = 1
    AND (`u`.`fovaros` IS NOT NULL OR `u`.`terulet` IS NOT NULL OR `u`.`penznem` IS NOT NULL)
) AS `v`
WHERE `orszagprofil`.`orszag_kod` = `v`.`kod` AND `orszagprofil`.`alapadatok` IS NOT NULL;
