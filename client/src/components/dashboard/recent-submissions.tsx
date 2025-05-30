import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, isToday, isYesterday } from "date-fns";

const RecentSubmissions: React.FC = () => {
  // Fetch user's submissions
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['/api/content/user'],
    select: (data) => {
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return [];
    }
  });

  // Format date to be more readable
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

  return (
    <Card className="bg-dark-200 rounded-xl mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Your Recent Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-destructive">Error loading submissions</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.slice(0, 3).map((submission) => (
              <div 
                key={submission.id} 
                className={`bg-dark-100 rounded-lg p-4 border-l-4 ${
                  submission.approved ? "border-success" : 
                  submission.rejected ? "border-destructive" : 
                  "border-warning"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-light-300 line-clamp-2">
                      {submission.text}
                    </p>
                    <div className="flex items-center mt-2 space-x-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-light-300" />
                        <span className="text-xs text-light-300">
                          {formatDate(submission.createdAt)}
                        </span>
                      </div>
                      <div className="flex space-x-1">
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
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {submission.tokenIssued ? (
                    <div className="relative token-glow bg-gradient-to-br from-secondary-400 to-primary-500 p-1 rounded-lg">
                      <Star className="h-5 w-5 text-light-100" />
                    </div>
                  ) : (
                    <div className={`text-xs font-medium ${
                      submission.approved ? "text-success px-2 py-0.5 bg-success/20" : 
                      submission.rejected ? "text-destructive px-2 py-0.5 bg-destructive/20" : 
                      "text-warning px-2 py-0.5 bg-warning/20"
                    } rounded-lg`}>
                      {submission.approved ? "Approved" : 
                       submission.rejected ? "Rejected" : 
                       "Pending"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-light-300">No submissions yet</p>
            <p className="text-light-300/70 text-sm mt-1">Submit content to see it here</p>
          </div>
        )}
        
        {submissions && submissions.length > 0 && (
          <Button asChild className="w-full mt-4 border border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white">
            <Link href="/profile">View All Submissions</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSubmissions;
