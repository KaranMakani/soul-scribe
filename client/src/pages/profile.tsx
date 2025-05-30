import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Clock, User, Star, FileText, Award, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";

const Profile: React.FC = () => {
  const { isAuthenticated, nearWallet } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("tokens");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['/api/content/user'],
    enabled: isAuthenticated,
    select: (data) => {
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return [];
    }
  });

  // Fetch user's SBTs
  const { data: tokens, isLoading: isLoadingTokens } = useQuery({
    queryKey: ['/api/tokens/user'],
    enabled: isAuthenticated
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Icon mapping based on token type
  const getTokenIcon = (type: string) => {
    switch (type) {
      case "Analysis Expert":
        return <FileText className="h-8 w-8 text-primary-400" />;
      case "Insight Provider":
        return <Award className="h-8 w-8 text-secondary-400" />;
      case "Tutorial Master":
        return <Star className="h-8 w-8 text-accent-400" />;
      default:
        return <Star className="h-8 w-8 text-primary-400" />;
    }
  };

  // Background gradient mapping based on token type
  const getTokenGradient = (type: string) => {
    switch (type) {
      case "Analysis Expert":
        return "from-secondary-400 to-primary-500";
      case "Insight Provider":
        return "from-secondary-400 to-accent-400";
      case "Tutorial Master":
        return "from-accent-400 to-primary-500";
      default:
        return "from-secondary-400 to-primary-500";
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect via the useEffect
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Profile Header */}
      <Card className="bg-dark-200 border-dark-100 mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center">
              <User className="h-12 w-12 text-light-100" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-light-100">{nearWallet}</h1>
              <div className="mt-2 text-light-300 font-mono text-sm">{nearWallet && `0x${nearWallet.substring(0, 8)}...${nearWallet.substring(nearWallet.length - 4)}`}</div>
              
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-dark-100 rounded-lg px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-light-100">{tokens?.length || 0}</div>
                  <div className="text-sm text-light-300">SBTs Earned</div>
                </div>
                
                <div className="bg-dark-100 rounded-lg px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-light-100">{submissions?.length || 0}</div>
                  <div className="text-sm text-light-300">Submissions</div>
                </div>
                
                <div className="bg-dark-100 rounded-lg px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-light-100">
                    {submissions?.filter(s => s.approved).length || 0}
                  </div>
                  <div className="text-sm text-light-300">Approved</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-dark-200 border-dark-100">
          <TabsTrigger value="tokens" className="data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-400">
            SoulBound Tokens
          </TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-400">
            Content Submissions
          </TabsTrigger>
        </TabsList>
        
        {/* SBTs Tab */}
        <TabsContent value="tokens">
          <Card className="bg-dark-200 border-dark-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Star className="mr-2 h-5 w-5 text-primary-400" />
                Your SoulBound Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTokens ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : tokens && tokens.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {tokens.map((token: any) => (
                    <div 
                      key={token.id} 
                      className={`token-glow aspect-square rounded-lg bg-gradient-to-br ${getTokenGradient(token.tokenType)} p-0.5`}
                    >
                      <div className="w-full h-full bg-dark-100 rounded-lg p-4 flex flex-col items-center justify-center">
                        {getTokenIcon(token.tokenType)}
                        <span className="mt-3 text-sm font-semibold text-light-100 text-center">
                          {token.name}
                        </span>
                        <span className="mt-1 text-xs text-light-300 text-center">
                          {token.description}
                        </span>
                        <span className="mt-2 text-xs text-light-300/60">#{token.tokenId.slice(-5)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-3" />
                  <p className="text-light-100">No SoulBound Tokens yet</p>
                  <p className="text-light-300 mt-2">Submit quality content to earn tokens</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-primary-500 text-primary-400"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <Card className="bg-dark-200 border-dark-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary-400" />
                Your Content Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSubmissions ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : submissions && submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission: any) => (
                    <div 
                      key={submission.id} 
                      className={`bg-dark-100 rounded-lg p-4 border-l-4 ${
                        submission.approved ? "border-success" : 
                        submission.rejected ? "border-destructive" : 
                        "border-warning"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-light-100 mb-3">{submission.text}</p>
                          
                          {submission.link && (
                            <a 
                              href={submission.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 text-sm break-all"
                            >
                              {submission.link}
                            </a>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-light-300" />
                              <span className="text-xs text-light-300">
                                {formatDate(submission.createdAt)}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {submission.categories.map((category: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant={
                                    category === "tutorial" ? "tutorial" : 
                                    category === "review" ? "review" : 
                                    category === "news" ? "news" : 
                                    category === "analysis" ? "analysis" : 
                                    category === "promo" ? "promo" : "other"
                                  }
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {submission.tokenIssued ? (
                            <div className="relative token-glow bg-gradient-to-br from-secondary-400 to-primary-500 p-1 rounded-lg">
                              <Star className="h-5 w-5 text-light-100" />
                            </div>
                          ) : (
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                              submission.approved ? "text-success bg-success/20" : 
                              submission.rejected ? "text-destructive bg-destructive/20" : 
                              "text-warning bg-warning/20"
                            }`}>
                              {submission.approved ? "Approved" : 
                               submission.rejected ? "Rejected" : 
                               "Pending"}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {submission.imageUrl && (
                        <div className="mt-4 rounded-lg overflow-hidden">
                          <img 
                            src={submission.imageUrl} 
                            alt="Content screenshot" 
                            className="max-w-full h-auto object-cover"
                          />
                        </div>
                      )}
                      
                      {submission.aiAnalysis && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="col-span-3 sm:col-span-1">
                            <div className="text-xs text-light-300">Grammar</div>
                            <div className="w-full bg-dark-200 rounded-full h-2 mt-1">
                              <div 
                                className={`${
                                  submission.aiAnalysis.grammar > 90 ? "bg-success" :
                                  submission.aiAnalysis.grammar > 75 ? "bg-info" :
                                  submission.aiAnalysis.grammar > 60 ? "bg-warning" : "bg-error"
                                } h-2 rounded-full`}
                                style={{ width: `${submission.aiAnalysis.grammar}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="col-span-3 sm:col-span-1">
                            <div className="text-xs text-light-300">Originality</div>
                            <div className="w-full bg-dark-200 rounded-full h-2 mt-1">
                              <div 
                                className={`${
                                  submission.aiAnalysis.originality > 90 ? "bg-success" :
                                  submission.aiAnalysis.originality > 75 ? "bg-info" :
                                  submission.aiAnalysis.originality > 60 ? "bg-warning" : "bg-error"
                                } h-2 rounded-full`}
                                style={{ width: `${submission.aiAnalysis.originality}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="col-span-3 sm:col-span-1">
                            <div className="text-xs text-light-300">Readability</div>
                            <div className="w-full bg-dark-200 rounded-full h-2 mt-1">
                              <div 
                                className={`${
                                  submission.aiAnalysis.readability > 90 ? "bg-success" :
                                  submission.aiAnalysis.readability > 75 ? "bg-info" :
                                  submission.aiAnalysis.readability > 60 ? "bg-warning" : "bg-error"
                                } h-2 rounded-full`}
                                style={{ width: `${submission.aiAnalysis.readability}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-3" />
                  <p className="text-light-100">No submissions yet</p>
                  <p className="text-light-300 mt-2">Create content to see it here</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-primary-500 text-primary-400"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Profile;
