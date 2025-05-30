import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertContentSchema, 
  insertSoulboundTokenSchema,
  contentCategories,
  type AIAnalysis
} from "@shared/schema";
import { analyzeContent } from "./nlp";

// Session type for authentication
declare module "express-session" {
  interface SessionData {
    userId: number;
    nearWallet: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  const ensureAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  };

  // AUTH ROUTES
  
  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    if (req.session.userId) {
      res.json({ authenticated: true, nearWallet: req.session.nearWallet });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // Login with NEAR wallet
  app.post("/api/auth/login", async (req, res) => {
    const schema = z.object({
      nearWallet: z.string().min(1),
      nearAddress: z.string().min(1),
    });
    
    try {
      const data = schema.parse(req.body);
      
      // Find or create user
      let user = await storage.getUserByNearWallet(data.nearWallet);
      
      if (!user) {
        // Create a new user
        const username = data.nearWallet.split('.')[0]; // Use the part before .near as username
        user = await storage.createUser({
          username,
          password: Math.random().toString(36).slice(2), // Random password since we use wallet auth
          nearWallet: data.nearWallet,
          nearAddress: data.nearAddress
        });
      }
      
      req.session.userId = user.id;
      req.session.nearWallet = user.nearWallet;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          nearWallet: user.nearWallet,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request", error: error });
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Error logging out" });
      } else {
        res.json({ success: true });
      }
    });
  });
  
  // Get current user
  app.get("/api/users/me", ensureAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      nearWallet: user.nearWallet,
      nearAddress: user.nearAddress,
      isAdmin: user.isAdmin
    });
  });
  
  // CONTENT ROUTES
  
  // Submit new content
  app.post("/api/content", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Validate the request body
      const data = insertContentSchema.parse({
        ...req.body,
        userId,
      });
      
      // Create the content
      const newContent = await storage.createContent(data);
      
      // Analyze the content
      const analysis = await analyzeContent(newContent.text);
      
      // Update the content with analysis
      const updatedContent = await storage.updateContentAnalysis(newContent.id, analysis);
      
      // // If analysis approves it automatically, issue a token
      // if (analysis.approved) {
      //   await storage.approveContent(newContent.id);
        
      //   // Generate token metadata
      //   const tokenMeta = generateSBTMetadata(updatedContent);
        
      //   // Create a soulbound token
      //   const token = await storage.createSoulboundToken({
      //     userId,
      //     contentId: newContent.id,
      //     tokenId: `${Date.now()}-${userId}-${Math.floor(Math.random() * 10000)}`,
      //     tokenType: tokenMeta.type,
      //     name: tokenMeta.name,
      //     description: tokenMeta.description,
      //     metadata: tokenMeta
      //   });
      // }
      
      res.status(201).json(updatedContent);
    } catch (error) {
      console.error("Content submission error:", error);
      res.status(400).json({ message: "Invalid content submission" });
    }
  });
  
  // Get content categories
  app.get("/api/content/categories", (req, res) => {
    res.json(contentCategories);
  });
  
  // Get user's content
  app.get("/api/content/user", ensureAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const contents = await storage.getContentsByUser(userId);
    res.json(contents);
  });
  
  // Get content feed
  app.get("/api/content/feed", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Only return approved content
    const allContents = await storage.getAllContents(limit, offset);
    const approvedContents = allContents.filter(c => c.approved);
    
    res.json(approvedContents);
  });
  
  // Get content by ID
  app.get("/api/content/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const content = await storage.getContent(id);
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    res.json(content);
  });
  
  // SBT ROUTES
  
  // Get user's tokens
  app.get("/api/tokens/user", ensureAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const tokens = await storage.getSoulboundTokensByUser(userId);
    res.json(tokens);
  });
  
  // LEADERBOARD ROUTES
  
  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await storage.getLeaderboard(limit);
    res.json(leaderboard);
  });
  
  // ADMIN ROUTES
  
  // Get all content for moderation (includes non-approved)
  app.get("/api/admin/content", ensureAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const contents = await storage.getAllContents(limit, offset);
    res.json(contents);
  });
  
  // Approve content
  app.post("/api/admin/content/:id/approve", ensureAdmin, async (req, res) => {    
    const id = parseInt(req.params.id);
    
    try {
      const content = await storage.getContent(id);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const updatedContent = await storage.approveContent(id);
      
      // If not already tokenized, create a token
      if (!updatedContent.tokenIssued) {
        // Generate token metadata
        const tokenMeta = req.body;
        
        // Create a soulbound token
        const token = await storage.createSoulboundToken({
          userId: updatedContent.userId,
          contentId: updatedContent.id,
          tokenId: tokenMeta.tokenId,
          tokenType: tokenMeta.type,
          name: tokenMeta.name,
          description: tokenMeta.description,
          metadata: tokenMeta
        });
      }
      
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: "Error approving content" });
    }
  });
  
  // Reject content
  app.post("/api/admin/content/:id/reject", ensureAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const content = await storage.getContent(id);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const updatedContent = await storage.rejectContent(id);
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: "Error rejecting content" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

// NLP helper function for content analysis
function analyzeContent(text: string): AIAnalysis {
  // Simple analysis logic
  const wordCount = text.split(/\s+/).length;
  const grammar = Math.min(100, 70 + Math.random() * 30);
  const originality = Math.min(100, 60 + Math.random() * 40);
  const readability = Math.min(100, 75 + Math.random() * 25);
  const aiGeneratedProbability = Math.random() * 0.3; // 0-30%
  
  // Determine metrics based on content
  const keywordStrength = wordCount > 100 ? "High" : wordCount > 50 ? "Medium" : "Low";
  const topicRelevance = text.length > 200 ? "High" : text.length > 100 ? "Medium" : "Low";
  const predictedEngagement = (grammar + originality) / 2 > 85 ? "Above Average" : 
                              (grammar + originality) / 2 > 70 ? "Average" : "Below Average";
  
  // Auto-approve if metrics are good
  const approved = grammar > 85 && originality > 80 && aiGeneratedProbability < 0.2;
  
  return {
    grammar,
    originality,
    readability,
    aiGeneratedProbability: aiGeneratedProbability * 100,
    keywordStrength,
    topicRelevance,
    predictedEngagement,
    approved
  };
}

// Function to generate SBT metadata based on content
function generateSBTMetadata(content: any) {
  // Determine token type based on content categories and quality
  let type = "Content Creator";
  let name = "Content Contribution";
  let description = "Awarded for submitting quality content";
  
  const categories = content.categories || [];
  
  if (categories.includes("tutorial")) {
    type = "Tutorial Master";
    name = "Knowledge Sharing";
    description = "Awarded for creating educational content";
  } else if (categories.includes("review")) {
    type = "Insight Provider";
    name = "Critical Analysis";
    description = "Awarded for thoughtful reviews";
  } else if (categories.includes("analysis")) {
    type = "Analysis Expert";
    name = "Deep Insights";
    description = "Awarded for detailed analytical content";
  }
  
  return {
    type,
    name,
    description,
    createdAt: new Date().toISOString(),
    contentId: content.id,
    categories: content.categories,
    imageUrl: `https://source.boringavatars.com/beam/120/${type}?colors=5F4B8B,00C2CB,FF7E5F,121212,F8F9FA`
  };
}
