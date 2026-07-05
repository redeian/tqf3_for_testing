CREATE TABLE `syllabi` (
	`id` varchar(36) NOT NULL,
	`course_code` varchar(20) NOT NULL,
	`course_name` varchar(200) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `syllabi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_schedules` (
	`id` varchar(36) NOT NULL,
	`syllabus_id` varchar(36) NOT NULL,
	`week_number` int NOT NULL,
	`topic` varchar(500),
	`activity_type` varchar(50),
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `weekly_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `weekly_schedules` ADD CONSTRAINT `weekly_schedules_syllabus_id_syllabi_id_fk` FOREIGN KEY (`syllabus_id`) REFERENCES `syllabi`(`id`) ON DELETE cascade ON UPDATE no action;