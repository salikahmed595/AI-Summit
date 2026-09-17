CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`owner` text NOT NULL,
	`mime` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `records_kind_slug` ON `records` (`kind`,`slug`);--> statement-breakpoint
CREATE INDEX `records_kind_status` ON `records` (`kind`,`status`);--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`ticket_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`amount` integer NOT NULL,
	`access_hash` text NOT NULL,
	`qr` text,
	`checked_at` text,
	`checked_by` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registration_event_email` ON `registrations` (`event_id`,`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `registration_qr` ON `registrations` (`qr`);--> statement-breakpoint
CREATE UNIQUE INDEX `registration_access` ON `registrations` (`access_hash`);--> statement-breakpoint
CREATE INDEX `registration_ticket_status` ON `registrations` (`ticket_id`,`status`);--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`capacity` integer NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tickets_event` ON `tickets` (`event_id`);