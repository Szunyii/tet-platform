ALTER TABLE `orszagprofil` ADD `nemzetkozi_kapcsolatok` text;--> statement-breakpoint
ALTER TABLE `orszagprofil` ADD `magyar_kapcsolatok` text;--> statement-breakpoint
-- Adat (kézzel hozzáadva): a régi `kapcsolatok` blokk öt mezője a két új blokkba. Ahol a régi blokk
-- mentett volt, mindkét új blokk mentett lesz (a hiányzó kulcs üres szöveg); a nem mentett (NULL)
-- sorban mindkettő NULL marad. A régi oszlopot a 0009 törli.
UPDATE `orszagprofil` SET
  `nemzetkozi_kapcsolatok` = json_object(
    'partnerorszagok', coalesce(json_extract(`kapcsolatok`, '$.partnerorszagok'), ''),
    'euMultilateralis', coalesce(json_extract(`kapcsolatok`, '$.euMultilateralis'), '')
  ),
  `magyar_kapcsolatok` = json_object(
    'egyezmeny', coalesce(json_extract(`kapcsolatok`, '$.egyezmeny'), ''),
    'ketoldalu', coalesce(json_extract(`kapcsolatok`, '$.ketoldalu'), ''),
    'mobilitas', coalesce(json_extract(`kapcsolatok`, '$.mobilitas'), '')
  )
WHERE `kapcsolatok` IS NOT NULL AND json_valid(`kapcsolatok`);
