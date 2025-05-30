import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, MessageCircle, Lightbulb, Plus } from "lucide-react";

const SBTCollection: React.FC = () => {
  // Fetch user's SBTs
  const { data: tokens, isLoading, error } = useQuery({
    queryKey: ['/api/tokens/user']
  });

  // Icon mapping based on token type
  const getTokenIcon = (type: string) => {
    switch (type) {
      case "Analysis Expert":
        return <FlaskConical className="h-8 w-8 text-primary-400" />;
      case "Insight Provider":
        return <Lightbulb className="h-8 w-8 text-secondary-400" />;
      case "Tutorial Master":
        return <MessageCircle className="h-8 w-8 text-accent-400" />;
      default:
        return <FlaskConical className="h-8 w-8 text-primary-400" />;
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

  return (
    <Card className="bg-dark-200 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Your SoulBound Tokens</CardTitle>
        <Link href="/profile" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-destructive">Error loading tokens</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tokens && tokens.length > 0 ? (
              // Display first 4 tokens
              tokens.slice(0, 4).map((token: any) => (
                <div 
                  key={token.id} 
                  className={`token-glow aspect-square rounded-lg bg-gradient-to-br ${getTokenGradient(token.tokenType)} p-0.5`}
                >
                  <div className="w-full h-full bg-dark-100 rounded-lg p-3 flex flex-col items-center justify-center">
                    {getTokenIcon(token.tokenType)}
                    <span className="mt-2 text-xs font-semibold text-light-100 text-center">
                      {token.name}
                    </span>
                    <span className="text-xs text-light-300">#{token.tokenId.slice(-5)}</span>
                  </div>
                </div>
              ))
            ) : null}
            
            {/* Always show the "empty" token slot */}
            <div className="aspect-square rounded-lg border-2 border-dashed border-dark-100 flex flex-col items-center justify-center">
              <Plus className="h-8 w-8 text-light-300/50" />
              <span className="mt-2 text-xs text-light-300/50 text-center">Keep Contributing</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SBTCollection;
