import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday } from "date-fns";
import { initNearWallet } from "@/lib/near";

import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Zap, 
  Star 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { mintSBT } from "@/lib/near"; 

const Admin: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("content");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    initNearWallet();
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch all content for moderation
  const { data: allContent, isLoading } = useQuery({
    queryKey: ['/api/admin/content'],
    enabled: isAuthenticated && isAdmin,
    select: (data) => {
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return [];
    }
  });

  // Mutation for approving content
  const approveContent = useMutation({
    mutationFn: async (content: any) => {
      console.log(content);

      
      const contentId = content.id;

      const categories = content.categories || [];
      let type: string = ""
      let name: string = ""
      let description: string = "";

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

      const tokenId = await mintSBT(content.nearWallet, `${type} - ${name}`);

      const payload = {
        type: type,
        name: name,
        description: description,
        tokenId: tokenId,
        contentId: contentId,
        categories: categories,
        createdAt: new Date().toISOString(),
        imageUrl: `https://source.boringavatars.com/beam/120/${type}?colors=5F4B8B,00C2CB,FF7E5F,121212,F8F9FA`
      }

      const response = await apiRequest("POST", `/api/admin/content/${content.id}/approve`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content approved",
        description: "SBT has been issued to the user"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    },
    onError: (error) => {
      console.log(error);
      
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  });

  // Mutation for rejecting content
  const rejectContent = useMutation({
    mutationFn: async (contentId: number) => {
      const response = await apiRequest("POST", `/api/admin/content/${contentId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content rejected",
        description: "The user has been notified"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
    },
    onError: (error) => {
      toast({
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
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

  // Filter content based on current filter and search term
  const filteredContent = allContent ? allContent.filter((content: any) => {
    // First apply status filter
    const statusMatch = 
      filter === "all" ? true :
      filter === "pending" ? (!content.approved && !content.rejected) :
      filter === "approved" ? content.approved :
      filter === "rejected" ? content.rejected : true;
    
    // Then apply search filter (if search term exists)
    const searchMatch = !searchTerm || 
      content.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.categories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  }) : [];

  // Calculate stats
  const getStats = () => {
    if (!allContent) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    return {
      total: allContent.length,
      pending: allContent.filter(c => !c.approved && !c.rejected).length,
      approved: allContent.filter(c => c.approved).length,
      rejected: allContent.filter(c => c.rejected).length
    };
  };

  const stats = getStats();

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect via the useEffect
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-light-100 flex items-center">
          <Shield className="mr-3 h-7 w-7 text-primary-400" />
          Admin Panel
        </h1>
        <p className="text-light-300 mt-2">Moderate content and manage platform settings</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="bg-dark-200 border-dark-100">
          <CardContent className="p-4">
            <div className="text-light-300 text-sm mb-1">Total Content</div>
            <div className="text-2xl font-bold text-light-100">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-200 border-dark-100">
          <CardContent className="p-4">
            <div className="text-warning text-sm mb-1">Pending Review</div>
            <div className="text-2xl font-bold text-light-100">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-200 border-dark-100">
          <CardContent className="p-4">
            <div className="text-success text-sm mb-1">Approved</div>
            <div className="text-2xl font-bold text-light-100">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-200 border-dark-100">
          <CardContent className="p-4">
            <div className="text-destructive text-sm mb-1">Rejected</div>
            <div className="text-2xl font-bold text-light-100">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-dark-200 border-dark-100">
          <TabsTrigger value="content" className="data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-400">
            Content Moderation
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-400">
            User Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary-500/20 data-[state=active]:text-primary-400">
            Platform Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Content Moderation Tab */}
        <TabsContent value="content">
          <Card className="bg-dark-200 border-dark-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary-400" />
                Content Moderation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-light-300" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] bg-dark-100 border-dark-100">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="border-dark-100">
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-300" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-dark-100 border-dark-100"
                  />
                </div>
              </div>
              
              {/* Content List */}
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-16">
                  <AlertTriangle className="h-12 w-12 text-light-300/50 mx-auto mb-3" />
                  <p className="text-light-100">No content found</p>
                  <p className="text-light-300 mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredContent.map((content: any) => (
                    <div 
                      key={content.id} 
                      className="bg-dark-100 rounded-lg p-5 border-l-4 border-l-dark-100"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                content.approved ? "success" : 
                                content.rejected ? "error" : 
                                "warning"
                              }>
                                {content.approved ? "Approved" : 
                                 content.rejected ? "Rejected" : 
                                 "Pending Review"}
                              </Badge>
                              <span className="text-xs text-light-300">User ID: {content.userId}</span>
                            </div>
                            <p className="text-light-100">{content.text}</p>
                          </div>
                          
                          {content.link && (
                            <a 
                              href={content.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 text-sm break-all mb-3 block"
                            >
                              {content.link}
                            </a>
                          )}
                          
                          {content.imageUrl && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              <img 
                                src={content.imageUrl} 
                                alt="Content screenshot" 
                                className="max-w-full h-auto object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-light-300" />
                              <span className="text-xs text-light-300">
                                {formatDate(content.createdAt)}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
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
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right column with AI analysis summary and action buttons */}
                        <div className="lg:w-72">
                          {content.aiAnalysis && (
                            <div className="bg-dark-200 rounded-lg p-3 mb-4">
                              <h4 className="text-sm font-medium text-light-100 mb-2">AI Analysis</h4>
                              
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-light-300">Grammar</span>
                                    <span className={`${
                                      content.aiAnalysis.grammar > 90 ? "text-success" :
                                      content.aiAnalysis.grammar > 75 ? "text-info" :
                                      content.aiAnalysis.grammar > 60 ? "text-warning" : "text-error"
                                    }`}>
                                      {Math.round(content.aiAnalysis.grammar)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-dark-100 rounded-full h-1.5 mt-1">
                                    <div 
                                      className={`${
                                        content.aiAnalysis.grammar > 90 ? "bg-success" :
                                        content.aiAnalysis.grammar > 75 ? "bg-info" :
                                        content.aiAnalysis.grammar > 60 ? "bg-warning" : "bg-error"
                                      } h-1.5 rounded-full`}
                                      style={{ width: `${content.aiAnalysis.grammar}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-light-300">Originality</span>
                                    <span className={`${
                                      content.aiAnalysis.originality > 90 ? "text-success" :
                                      content.aiAnalysis.originality > 75 ? "text-info" :
                                      content.aiAnalysis.originality > 60 ? "text-warning" : "text-error"
                                    }`}>
                                      {Math.round(content.aiAnalysis.originality)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-dark-100 rounded-full h-1.5 mt-1">
                                    <div 
                                      className={`${
                                        content.aiAnalysis.originality > 90 ? "bg-success" :
                                        content.aiAnalysis.originality > 75 ? "bg-info" :
                                        content.aiAnalysis.originality > 60 ? "bg-warning" : "bg-error"
                                      } h-1.5 rounded-full`}
                                      style={{ width: `${content.aiAnalysis.originality}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between text-xs mt-2">
                                  <span className="text-light-300">AI Generated</span>
                                  <span className={`${
                                    content.aiAnalysis.aiGeneratedProbability < 20 ? "text-success" :
                                    content.aiAnalysis.aiGeneratedProbability < 50 ? "text-warning" :
                                    "text-error"
                                  }`}>
                                    {Math.round(content.aiAnalysis.aiGeneratedProbability)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          <div className="flex flex-col gap-2">
                            {!content.approved && !content.rejected && (
                              <>
                                <Button
                                  variant="default"
                                  className="w-full bg-success hover:bg-success/90 text-black flex items-center justify-center"
                                  onClick={() => approveContent.mutate(content)}
                                  disabled={approveContent.isPending}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve & Issue SBT
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  className="w-full flex items-center justify-center"
                                  onClick={() => rejectContent.mutate(content.id)}
                                  disabled={rejectContent.isPending}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {content.approved && (
                              <div className="flex items-center text-success">
                                <CheckCircle className="mr-2 h-5 w-5" />
                                <span>Approved {content.tokenIssued && <>(SBT Issued)</>}</span>
                              </div>
                            )}
                            
                            {content.rejected && (
                              <div className="flex items-center text-destructive">
                                <XCircle className="mr-2 h-5 w-5" />
                                <span>Rejected</span>
                              </div>
                            )}
                            
                            {content.tokenIssued && (
                              <div className="flex items-center text-secondary-400 mt-2">
                                <Star className="mr-2 h-5 w-5" />
                                <span>Token ID: {content.tokenId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Management Tab */}
        <TabsContent value="users">
          <Card className="bg-dark-200 border-dark-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <p className="text-light-100">User management will be implemented in a future update</p>
                <p className="text-light-300 mt-2">This feature is coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Platform Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-dark-200 border-dark-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <p className="text-light-100">Platform settings will be implemented in a future update</p>
                <p className="text-light-300 mt-2">This feature is coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Admin;
