import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import SubmissionForm from "@/components/dashboard/submission-form";
import AIAnalysis from "@/components/dashboard/ai-analysis";
import RecentSubmissions from "@/components/dashboard/recent-submissions";
import SBTCollection from "@/components/dashboard/sbt-collection";

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect via the useEffect
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-light-100">Dashboard</h1>
        <p className="text-light-300 mt-2">Create and analyze your content, earn SoulBound Tokens.</p>
      </div>
      
      {/* Content Submission Form */}
      <SubmissionForm />
      
      {/* AI Analysis Results */}
      <AIAnalysis />
      
      {/* Recent Submissions */}
      <RecentSubmissions />
      
      {/* SBT Collection Preview */}
      <SBTCollection />
    </main>
  );
};

export default Dashboard;
