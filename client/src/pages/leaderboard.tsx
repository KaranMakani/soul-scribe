import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Gift, Calendar } from "lucide-react";

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>("all-time");
  
  // Fetch leaderboard
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['/api/leaderboard']
  });
  
  // Helper functions for rendering
  const getPositionIndicator = (position: number) => {
    switch (position) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-dark-300" />
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <Medal className="h-4 w-4 text-dark-300" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center">
            <Medal className="h-4 w-4 text-dark-300" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center">
            <span className="text-light-300 font-medium">{position + 1}</span>
          </div>
        );
    }
  };
  
  // Get badge for tokens count
  const getTokenBadge = (count: number) => {
    if (count >= 10) return "bg-gradient-to-r from-primary-500 to-secondary-400 text-white";
    if (count >= 5) return "bg-secondary-500/20 text-secondary-400";
    return "bg-primary-500/20 text-primary-400";
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-light-100">Leaderboard</h1>
        <p className="text-light-300 mt-2">Top contributors by SoulBound Tokens earned</p>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-light-300" />
          <span className="text-light-300">Timeframe:</span>
        </div>
        
        <div className="flex space-x-2">
          <Badge 
            variant={timeframe === "all-time" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setTimeframe("all-time")}
          >
            All Time
          </Badge>
          <Badge 
            variant={timeframe === "monthly" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setTimeframe("monthly")}
          >
            This Month
          </Badge>
          <Badge 
            variant={timeframe === "weekly" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setTimeframe("weekly")}
          >
            This Week
          </Badge>
        </div>
      </div>
      
      <Card className="bg-dark-200 border-dark-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg">Error loading leaderboard</p>
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((user: any, index: number) => (
                <div 
                  key={user.userId} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? "bg-dark-100/70" : "bg-dark-100/30"
                  }`}
                >
                  <div className="flex items-center">
                    {getPositionIndicator(index)}
                    <div className="ml-4">
                      <div className="text-light-100 font-medium">{user.nearWallet}</div>
                      <div className="text-light-300 text-sm">{user.username}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`font-medium ${getTokenBadge(user.tokenCount)}`}>
                      {user.tokenCount} SBTs
                    </Badge>
                    
                    {index === 0 && (
                      <Gift className="ml-3 h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-light-100">No contributors yet</p>
              <p className="text-light-300 mt-2">Be the first to earn SoulBound Tokens!</p>
            </div>
          )}
          
          {/* Current User Position */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-8 p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <span className="text-primary-400 font-medium">?</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-light-100 font-medium">Your Position</div>
                    <div className="text-light-300 text-sm">Keep contributing to climb the ranks!</div>
                  </div>
                </div>
                
                <Badge variant="primary">
                  ? SBTs
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reward explanation */}
      <div className="mt-8 bg-dark-200 rounded-xl p-6 border border-dark-100">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <Gift className="mr-2 h-5 w-5 text-secondary-400" />
          Monthly Rewards
        </h2>
        
        <p className="text-light-300 mb-4">
          Top contributors at the end of each month receive special rewards and exclusive SBTs to recognize their valuable contributions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-100 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              <h3 className="font-semibold text-light-100">1st Place</h3>
            </div>
            <p className="text-light-300 text-sm">
              Exclusive "Champion" SBT and featured spotlight on the platform
            </p>
          </div>
          
          <div className="bg-dark-100 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Medal className="h-5 w-5 mr-2 text-gray-300" />
              <h3 className="font-semibold text-light-100">2nd Place</h3>
            </div>
            <p className="text-light-300 text-sm">
              "Silver Contributor" SBT and recognition in the community
            </p>
          </div>
          
          <div className="bg-dark-100 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Medal className="h-5 w-5 mr-2 text-amber-700" />
              <h3 className="font-semibold text-light-100">3rd Place</h3>
            </div>
            <p className="text-light-300 text-sm">
              "Bronze Contributor" SBT and special mention
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Leaderboard;
