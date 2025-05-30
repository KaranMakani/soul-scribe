// Client-side content analysis utility using natural language processing techniques
// This is a simplified implementation for the MVP

// Types for analysis results
export interface ContentAnalysis {
  grammar: number;
  originality: number;
  readability: number;
  aiGeneratedProbability: number;
  keywordStrength: "Low" | "Medium" | "High";
  topicRelevance: "Low" | "Medium" | "High";
  predictedEngagement: "Below Average" | "Average" | "Above Average";
  approved: boolean;
}

// Function to show analysis explanation messages based on scores
export function getAnalysisMessage(analysis: ContentAnalysis) {
  // Grammar score message
  const getGrammarMessage = () => {
    if (analysis.grammar > 90) return "Excellent grammar and structure.";
    if (analysis.grammar > 80) return "Good grammar with minor improvements possible.";
    if (analysis.grammar > 70) return "Acceptable grammar, but could use some editing.";
    return "Consider reviewing the grammar and structure.";
  };

  // Originality score message
  const getOriginalityMessage = () => {
    if (analysis.originality > 90) return "Highly original content.";
    if (analysis.originality > 80) return "Good level of originality.";
    if (analysis.originality > 70) return "Shows some originality but could be more unique.";
    return "Consider adding more original perspectives.";
  };

  // AI-generated probability message
  const getAIMessage = () => {
    if (analysis.aiGeneratedProbability < 15) return "Low likelihood of AI generation.";
    if (analysis.aiGeneratedProbability < 30) return "Some AI-like patterns detected.";
    if (analysis.aiGeneratedProbability < 50) return "Moderate likelihood of AI assistance.";
    return "High probability of AI-generated content.";
  };

  // Overall assessment
  const getOverallMessage = () => {
    if (analysis.approved) {
      return "Content approved for SBT issuance!";
    } else {
      return "Content needs improvement before SBT issuance.";
    }
  };

  return {
    grammar: getGrammarMessage(),
    originality: getOriginalityMessage(),
    aiGenerated: getAIMessage(),
    overall: getOverallMessage()
  };
}

// Function to generate color classes based on score
export function getScoreColorClass(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 75) return "text-info";
  if (score >= 60) return "text-warning";
  return "text-error";
}

// Function to generate progress bar color classes based on score
export function getProgressColorClass(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 75) return "bg-info";
  if (score >= 60) return "bg-warning";
  return "bg-error";
}
