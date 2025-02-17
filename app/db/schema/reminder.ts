import { withZod } from "@rvf/zod";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

export const reminder = pgTable("reminder", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
  time: timestamp().notNull(),
});
export type Reminder = typeof reminder.$inferSelect;

export const reminderValidator = withZod(
  z.object({
    id: z.string().optional(),
    name: z.string().nonempty(),
    time: z.date({ coerce: true }),
  })
);