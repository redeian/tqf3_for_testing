import { relations } from "drizzle-orm";
import { int, mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const syllabi = mysqlTable("syllabi", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseCode: varchar("course_code", { length: 20 }).notNull(),
  courseName: varchar("course_name", { length: 200 }).notNull(),
  level: varchar("level", { length: 20 }).notNull().default("undergraduate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const weeklySchedules = mysqlTable("weekly_schedules", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  syllabusId: varchar("syllabus_id", { length: 36 })
    .notNull()
    .references(() => syllabi.id, { onDelete: "cascade" }),
  weekNumber: int("week_number").notNull(),
  topic: varchar("topic", { length: 500 }),
  activityType: varchar("activity_type", { length: 50 }),
  sortOrder: int("sort_order").notNull().default(0),
});

export const syllabiRelations = relations(syllabi, ({ many }) => ({
  weeklySchedules: many(weeklySchedules),
}));

export const weeklySchedulesRelations = relations(
  weeklySchedules,
  ({ one }) => ({
    syllabus: one(syllabi, {
      fields: [weeklySchedules.syllabusId],
      references: [syllabi.id],
    }),
  })
);
