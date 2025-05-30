import { type AIAnalysis, type Content } from "@shared/schema";

// NLP helper function for content analysis
export function analyzeContent(text: string): AIAnalysis {
  // Simple analysis logic for demonstration
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).length - 1;
  
  // Generate scores with some randomness for demonstration
  const grammar = Math.min(100, 70 + Math.random() * 30);
  const originality = Math.min(100, 60 + Math.random() * 40);
  const readability = Math.min(100, 75 + Math.random() * 25);
  const aiGeneratedProbability = Math.random() * 0.3; // 0-30%
  
  // Determine metrics based on content
  const keywordStrength = wordCount > 100 ? "High" : wordCount > 50 ? "Medium" : "Low";
  const topicRelevance = text.length > 200 ? "High" : text.length > 100 ? "Medium" : "Low";
  
  // More diverse content with varied sentence lengths tends to be more engaging
  const avgSentenceLength = wordCount / Math.max(1, sentenceCount);
  const predictedEngagement = avgSentenceLength > 15 && avgSentenceLength < 25 ? "Above Average" : 
                             avgSentenceLength > 10 && avgSentenceLength < 30 ? "Average" : "Below Average";
  
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
export function generateSBTMetadata(content: Content) {
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
  } else if (categories.includes("news")) {
    type = "News Reporter";
    name = "Breaking Updates";
    description = "Awarded for sharing timely information";
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
