import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Zap, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAnalysisMessage, getScoreColorClass, getProgressColorClass } from "@/lib/nlp";
import { Button } from "@/components/ui/button";

interface AIAnalysisProps {
  contentId?: number;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ contentId }) => {
  // Fetch analysis results for the given content
  const { data: content, isLoading, error } = useQuery({
    queryKey: contentId ? [`/api/content/${contentId}`] : ['/api/content/user'],
    enabled: !!contentId,
    select: (data) => {
      // If contentId is provided, return that specific content
      if (contentId) return data;
      
      // Otherwise find the most recent content with analysis
      if (Array.isArray(data) && data.length > 0) {
        const sortedContent = [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return sortedContent.find(c => c.aiAnalysis) || null;
      }
      return null;
    }
  });

  // If no content with analysis is found
  if (!content && !isLoading) {
    return (
      <Card className="bg-dark-200 rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-light-300/50 mx-auto mb-3" />
            <p className="text-light-300">No analysis results available</p>
            <p className="text-light-300/70 text-sm mt-2">Submit content to see AI analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-dark-200 rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-light-300 mt-4">Loading analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !content || !content.aiAnalysis) {
    return (
      <Card className="bg-dark-200 rounded-xl mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-light-300">Could not load analysis results</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysisMessages = getAnalysisMessage(content.aiAnalysis);

  return (
    <Card className="bg-dark-200 rounded-xl mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">AI Analysis Results</CardTitle>
        <Badge variant="info" className="text-xs">Latest Submission</Badge>
      </CardHeader>
      <CardContent>
        <div className="bg-dark-100 rounded-lg p-4 mb-4">
          <div className="text-sm text-light-300 mb-3 line-clamp-3">
            {content.text}
          </div>
          <div className="flex flex-wrap gap-2">
            {content.categories.map((category: string, index: number) => (
              <Badge 
                key={index} 
                variant={
                  category === "tutorial" ? "tutorial" : 
                  category === "review" ? "review" : 
                  category === "news" ? "news" : 
                  category === "analysis" ? "analysis" : 
                  category === "promo" ? "promo" : "other"
                }
                className="text-xs"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-100 rounded-lg p-4">
            <h3 className="text-light-100 font-medium mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-success" />
              Content Quality
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-300">Grammar</span>
                  <span className={`text-xs ${getScoreColorClass(content.aiAnalysis.grammar)}`}>
                    {Math.round(content.aiAnalysis.grammar)}/100
                  </span>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2">
                  <div 
                    className={`${getProgressColorClass(content.aiAnalysis.grammar)} h-2 rounded-full`}
                    style={{ width: `${content.aiAnalysis.grammar}%` }}
                  ></div>
                </div>
                <div className="text-xs text-light-300/70 mt-1">
                  {analysisMessages.grammar}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-300">Originality</span>
                  <span className={`text-xs ${getScoreColorClass(content.aiAnalysis.originality)}`}>
                    {Math.round(content.aiAnalysis.originality)}/100
                  </span>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2">
                  <div 
                    className={`${getProgressColorClass(content.aiAnalysis.originality)} h-2 rounded-full`}
                    style={{ width: `${content.aiAnalysis.originality}%` }}
                  ></div>
                </div>
                <div className="text-xs text-light-300/70 mt-1">
                  {analysisMessages.originality}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-300">Readability</span>
                  <span className={`text-xs ${getScoreColorClass(content.aiAnalysis.readability)}`}>
                    {Math.round(content.aiAnalysis.readability)}/100
                  </span>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2">
                  <div 
                    className={`${getProgressColorClass(content.aiAnalysis.readability)} h-2 rounded-full`}
                    style={{ width: `${content.aiAnalysis.readability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-100 rounded-lg p-4">
            <h3 className="text-light-100 font-medium mb-3 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-info" />
              Engagement Potential
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-light-300">AI-generated probability</span>
                <span className={`text-sm font-medium ${
                  content.aiAnalysis.aiGeneratedProbability < 20 ? "text-success" :
                  content.aiAnalysis.aiGeneratedProbability < 50 ? "text-warning" :
                  "text-destructive"
                }`}>
                  {content.aiAnalysis.aiGeneratedProbability < 20 ? "Low" :
                   content.aiAnalysis.aiGeneratedProbability < 50 ? "Medium" :
                   "High"} ({Math.round(content.aiAnalysis.aiGeneratedProbability)}%)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-light-300">Keyword strength</span>
                <span className={`text-sm font-medium ${
                  content.aiAnalysis.keywordStrength === "High" ? "text-info" :
                  content.aiAnalysis.keywordStrength === "Medium" ? "text-warning" :
                  "text-light-300"
                }`}>
                  {content.aiAnalysis.keywordStrength}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-light-300">Topic relevance</span>
                <span className={`text-sm font-medium ${
                  content.aiAnalysis.topicRelevance === "High" ? "text-info" :
                  content.aiAnalysis.topicRelevance === "Medium" ? "text-warning" :
                  "text-light-300"
                }`}>
                  {content.aiAnalysis.topicRelevance}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-light-300">Predicted engagement</span>
                <span className={`text-sm font-medium ${
                  content.aiAnalysis.predictedEngagement === "Above Average" ? "text-success" :
                  content.aiAnalysis.predictedEngagement === "Average" ? "text-info" :
                  "text-warning"
                }`}>
                  {content.aiAnalysis.predictedEngagement}
                </span>
              </div>
              
              <div className="pt-2 text-xs text-light-300/70">
                {analysisMessages.aiGenerated}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            {content.aiAnalysis.approved || content.approved ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2 text-success" />
                <span className="text-success font-medium">Content Approved for SBT</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                <span className="text-warning font-medium">Needs improvement for SBT</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-light-300 hover:text-light-100">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAnalysis;
