import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Zap, FileText, Award, Shield } from "lucide-react";

const Home: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  
  const handleConnectWallet = async () => {
    try {
      // Connect to NEAR wallet
      console.log("Home page: Starting wallet connection...");
      
      if (typeof window.connectNearWallet !== 'function') {
        console.error("Home page: NEAR wallet function not available");
        return;
      }
      
      const walletInfo = await window.connectNearWallet();
      console.log("Home page: Wallet connection result:", walletInfo);
      
      if (walletInfo) {
        // Login function handles redirection to dashboard
        console.log("Home page: Attempting login with wallet:", walletInfo.walletId);
        await login(walletInfo.walletId, walletInfo.publicAddress);
      } else {
        console.error("Home page: Failed to connect wallet");
      }
    } catch (error) {
      console.error("Home page: Wallet connection error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
            SoulScribe
          </h1>
          <p className="mt-4 text-xl text-light-100 max-w-3xl mx-auto">
            Web3-integrated content curation platform with AI analysis and Soulbound Token rewards
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="bg-gradient-to-r from-primary-500 to-secondary-400 hover:opacity-90">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary-500 to-secondary-400 hover:opacity-90"
                onClick={handleConnectWallet}
              >
                Connect NEAR Wallet
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="border-light-300 text-light-100">
              <Link href="/feed">Explore Content</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-light-100">Platform Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-dark-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-100">Content Submission</h3>
            <p className="text-light-300">Share short-form content including text, links, and screenshots to contribute to the community.</p>
          </div>
          
          <div className="bg-dark-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-100">AI Analysis</h3>
            <p className="text-light-300">Get instant feedback on your content's quality, originality, and potential engagement.</p>
          </div>
          
          <div className="bg-dark-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-accent-400/20 rounded-full flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-accent-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-100">Soulbound Tokens (SBTs)</h3>
            <p className="text-light-300">Earn non-transferable tokens for your original, high-quality contributions that stay with your identity.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-light-100">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-light-100 font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-100">Connect Your Wallet</h3>
            <p className="text-light-300">Sign in with your NEAR wallet to get started with SoulScribe.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-light-100 font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-100">Submit Quality Content</h3>
            <p className="text-light-300">Create and share your insights, tutorials, reviews, or analyses.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-light-100 font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-100">Earn Soulbound Tokens</h3>
            <p className="text-light-300">Receive SBTs for approved content that becomes part of your digital identity.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-primary-500/20 to-secondary-400/20 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold text-light-100 mb-4">Ready to start contributing?</h2>
          <p className="text-light-300 mb-8 max-w-2xl mx-auto">
            Join our community of content creators and earn recognition for your contributions with Soulbound Tokens.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg" className="bg-gradient-to-r from-primary-500 to-secondary-400 hover:opacity-90">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary-500 to-secondary-400 hover:opacity-90"
              onClick={handleConnectWallet}
            >
              Connect NEAR Wallet
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
