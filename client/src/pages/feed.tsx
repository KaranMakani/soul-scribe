import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, ThumbsUp, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Feed: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 10;
  
  // Fetch content feed
  const { data, isLoading, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useQuery({
    queryKey: ['/api/content/feed', { limit, offset: page * limit }],
    keepPreviousData: true
  });
  
  // Categories for filter
  const { data: categories } = useQuery({
    queryKey: ['/api/content/categories']
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
  
  // Filter content by category
  const filteredContent = data ? 
    selectedCategory === "all" ? 
      data : 
      data.filter((item: any) => item.categories.includes(selectedCategory)) 
    : [];

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-light-100">Content Feed</h1>
          <p className="text-light-300 mt-2">Discover curated content from the community</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-light-300" />
            <span className="text-light-300 mr-2">Filter:</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 bg-dark-200 border-dark-100">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border border-dark-100 shadow-md z-50">
              <SelectItem value="all">All Categories</SelectItem>
              {categories && categories.map((category: string) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-destructive text-lg">Error loading content</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-light-100 text-lg">No content available</p>
          <p className="text-light-300 mt-2">
            {selectedCategory !== "all" 
              ? `There are no posts in the ${selectedCategory} category yet.` 
              : "Check back later for new content."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredContent.map((item: any) => (
            <Card key={item.id} className="bg-dark-200 border-dark-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="mb-4">
                      <p className="text-light-100 mb-3">{item.text}</p>
                      
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm break-all"
                        >
                          {item.link}
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-light-300" />
                        <span className="text-xs text-light-300">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map((category: string, index: number) => (
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
                  
                  {item.tokenIssued && (
                    <div className="token-glow bg-gradient-to-br from-secondary-400 to-primary-500 p-1 rounded-lg">
                      <Star className="h-5 w-5 text-light-100" />
                    </div>
                  )}
                </div>
                
                {item.imageUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt="Content screenshot" 
                      className="w-full object-cover"
                    />
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" className="text-light-300 hover:text-light-100">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Upvote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              className="border-primary-500 text-primary-400"
              onClick={() => setPage(prev => prev + 1)}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage 
                ? "Loading more..." 
                : hasNextPage 
                ? "Load More" 
                : "No more content"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Feed;
