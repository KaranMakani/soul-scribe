import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nearWallet: text("near_wallet").notNull().unique(),
  nearAddress: text("near_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nearWallet: true,
  nearAddress: true,
});

// Content table
export const contentCategories = ["tutorial", "review", "news", "analysis", "promo", "other"] as const;

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  link: text("link"),
  imageUrl: text("image_url"),
  categories: text("categories").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  aiAnalysis: json("ai_analysis").$type<AIAnalysis>(),
  approved: boolean("approved").default(false),
  rejected: boolean("rejected").default(false),
  tokenIssued: boolean("token_issued").default(false),
  tokenId: text("token_id"),
});

export const insertContentSchema = createInsertSchema(content)
  .pick({
    userId: true,
    text: true,
    link: true,
    imageUrl: true,
    categories: true,
  })
  .extend({
    categories: z.array(z.enum(contentCategories)).min(1),
  });

// AI Analysis interface
export interface AIAnalysis {
  grammar: number;
  originality: number;
  readability: number;
  aiGeneratedProbability: number;
  keywordStrength: "Low" | "Medium" | "High";
  topicRelevance: "Low" | "Medium" | "High";
  predictedEngagement: "Below Average" | "Average" | "Above Average";
  approved: boolean;
}

// SBT (Soulbound Token) table
export const soulboundTokens = pgTable("soulbound_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").references(() => content.id),
  tokenId: text("token_id").notNull(),
  tokenType: text("token_type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSoulboundTokenSchema = createInsertSchema(soulboundTokens).pick({
  userId: true,
  contentId: true,
  tokenId: true,
  tokenType: true,
  name: true,
  description: true,
  metadata: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type SoulboundToken = typeof soulboundTokens.$inferSelect;
export type InsertSoulboundToken = z.infer<typeof insertSoulboundTokenSchema>;
