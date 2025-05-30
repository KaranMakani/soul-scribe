import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Feed from "@/pages/feed";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/context/auth-context";

function Router() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-dark-300 text-light-100">
      <Sidebar />
      <div className="flex-1 relative">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/feed" component={Feed} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
        <MobileNav />
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nearWallet, setNearWallet] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
        setNearWallet(data.nearWallet || null);

        if (data.authenticated) {
          const userRes = await fetch("/api/users/me");
          if (userRes.ok) {
            const userData = await userRes.json();
            setIsAdmin(userData.isAdmin);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (walletId: string, address: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { nearWallet: walletId, nearAddress: address });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setNearWallet(data.user.nearWallet);
        setIsAdmin(data.user.isAdmin);

        toast({
          title: "Logged in successfully",
          description: `Welcome, ${data.user.username}`,
        });

        window.location.href = "/dashboard";
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Login failed",
        description: "Could not login with NEAR wallet",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setIsAuthenticated(false);
      setNearWallet(null);
      setIsAdmin(false);
      toast({ title: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ isAuthenticated, nearWallet, login, logout, isAdmin }}>
          <Toaster />
          <Router />
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
