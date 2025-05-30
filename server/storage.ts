import { db } from "./lib/db";
import { eq,sql } from "drizzle-orm";
import {
  users,
  content,
  soulboundTokens,
  type User,
  type InsertUser,
  type Content,
  type InsertContent,
  type SoulboundToken,
  type InsertSoulboundToken,
  type AIAnalysis,
} from "@shared/schema";

export class DbStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async getUserByNearWallet(wallet: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.nearWallet, wallet))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    const result = await db
      .select()
      .from(content)
      .where(eq(content.id, id))
      .limit(1);
    return result[0];
  }

  async getContentsByUser(userId: number): Promise<Content[]> {
    return await db.select().from(content).where(eq(content.userId, userId));
  }

  // async getAllContents(limit = 10, offset = 0): Promise<Content[]> {
  //   return await db
  //     .select()
  //     .from(content)
  //     .orderBy(content.createdAt)
  //     .limit(limit)
  //     .offset(offset);
  // }

  async getAllContents(limit = 10, offset = 0): Promise<(any)[]> {
    return await db
      .select({
        id: content.id,
        userId: content.userId,
        text: content.text,
        link: content.link,
        imageUrl: content.imageUrl,
        categories: content.categories,
        createdAt: content.createdAt,
        aiAnalysis: content.aiAnalysis,
        approved: content.approved,
        rejected: content.rejected,
        tokenIssued: content.tokenIssued,
        tokenId: content.tokenId,
        nearWallet: users.nearWallet,
      })
      .from(content)
      .innerJoin(users, eq(content.userId, users.id))
      .orderBy(content.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async createContent(data: InsertContent): Promise<Content> {
    const result = await db.insert(content).values(data).returning();
    return result[0];
  }

  async updateContentAnalysis(
    id: number,
    analysis: AIAnalysis
  ): Promise<Content> {
    const result = await db
      .update(content)
      .set({ aiAnalysis: analysis })
      .where(eq(content.id, id))
      .returning();
    return result[0];
  }

  async approveContent(id: number): Promise<Content> {
    const result = await db
      .update(content)
      .set({ approved: true, rejected: false })
      .where(eq(content.id, id))
      .returning();
    return result[0];
  }

  async rejectContent(id: number): Promise<Content> {
    const result = await db
      .update(content)
      .set({ approved: false, rejected: true })
      .where(eq(content.id, id))
      .returning();
    return result[0];
  }

  async updateContentTokenId(id: number, tokenId: string): Promise<Content> {
    const result = await db
      .update(content)
      .set({ tokenIssued: true, tokenId })
      .where(eq(content.id, id))
      .returning();
    return result[0];
  }

  // SBT methods
  async getSoulboundToken(id: number): Promise<SoulboundToken | undefined> {
    const result = await db
      .select()
      .from(soulboundTokens)
      .where(eq(soulboundTokens.id, id))
      .limit(1);
    return result[0];
  }

  async getSoulboundTokensByUser(userId: number): Promise<SoulboundToken[]> {
    return await db
      .select()
      .from(soulboundTokens)
      .where(eq(soulboundTokens.userId, userId));
  }

  async createSoulboundToken(
    data: InsertSoulboundToken
  ): Promise<SoulboundToken> {
    const result = await db.insert(soulboundTokens).values(data).returning();
    await this.updateContentTokenId(data.contentId!, data.tokenId);
    return result[0];
  }

  // Leaderboard logic
  async getLeaderboard(
    limit = 10
  ): Promise<
    {
      userId: number;
      username: string;
      nearWallet: string;
      tokenCount: number;
    }[]
  > {
    const result = await db
      .select({
        userId: soulboundTokens.userId,
        tokenCount: sql<number>`COUNT(*)`,
      })
      .from(soulboundTokens)
      .groupBy(soulboundTokens.userId)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(limit);

    const usersList = await db.select().from(users);

    return result.map((entry) => {
      const user = usersList.find((u) => u.id === entry.userId);
      return {
        userId: entry.userId,
        username: user?.username || "Unknown",
        nearWallet: user?.nearWallet || "Unknown",
        tokenCount: entry.tokenCount,
      };
    });
  }
}

export const storage = new DbStorage();
