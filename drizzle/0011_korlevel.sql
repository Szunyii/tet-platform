ALTER TABLE `ticket` ADD `korlevel_id` text;--> statement-breakpoint
CREATE INDEX `ticket_korlevel_idx` ON `ticket` (`korlevel_id`);