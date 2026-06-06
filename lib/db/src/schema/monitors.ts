import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const monitorStatusEnum = pgEnum("monitor_status", ["up", "down", "unknown"]);
export const checkStatusEnum = pgEnum("check_status", ["up", "down"]);

export const monitorsTable = pgTable("monitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  intervalMinutes: integer("interval_minutes").notNull().default(5),
  status: monitorStatusEnum("status").notNull().default("unknown"),
  enabled: boolean("enabled").notNull().default(true),
  lastCheckedAt: timestamp("last_checked_at"),
  lastResponseMs: integer("last_response_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const checksTable = pgTable("checks", {
  id: serial("id").primaryKey(),
  monitorId: integer("monitor_id").notNull().references(() => monitorsTable.id, { onDelete: "cascade" }),
  status: checkStatusEnum("status").notNull(),
  responseMs: integer("response_ms"),
  statusCode: integer("status_code"),
  error: text("error"),
  checkedAt: timestamp("checked_at").notNull().defaultNow(),
});

export const appSettingsTable = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const insertMonitorSchema = createInsertSchema(monitorsTable).omit({ id: true, createdAt: true });
export type InsertMonitor = z.infer<typeof insertMonitorSchema>;
export type Monitor = typeof monitorsTable.$inferSelect;
export type Check = typeof checksTable.$inferSelect;
export type AppSetting = typeof appSettingsTable.$inferSelect;
