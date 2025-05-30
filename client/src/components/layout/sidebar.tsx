import React from "react";
import { Link, useLocation } from "wouter";
import ConnectWallet from "@/components/wallet/connect-wallet";
import { useAuth } from "@/context/auth-context";
import {
  Home,
  ClipboardList,
  FileText,
  BarChart2,
  User,
  ShieldCheck,
  Pen,
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-5 w-5 mr-3" />,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <ClipboardList className="h-5 w-5 mr-3" />,
      requiresAuth: true,
    },
    {
      name: "Content Feed",
      path: "/feed",
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: <BarChart2 className="h-5 w-5 mr-3" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5 mr-3" />,
      requiresAuth: true,
    },
    {
      name: "Admin Panel",
      path: "/admin",
      icon: <ShieldCheck className="h-5 w-5 mr-3" />,
      requiresAuth: true,
      requiresAdmin: true,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-dark-200 border-r border-dark-100 p-4 h-screen sticky top-0">
      <div className="flex items-center justify-center mb-8 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
            <Pen className="h-6 w-6 text-light-100" />
          </div>
          <h1 className="text-xl font-bold text-light-100">SoulScribe</h1>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            // Skip if item requires auth and user is not authenticated
            if (item.requiresAuth && !isAuthenticated) return null;
            // Skip if item requires admin and user is not admin
            if (item.requiresAdmin && !isAdmin) return null;

            const isActive = location === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isActive
                      ? "text-primary-400 bg-primary-500/20"
                      : "text-light-100 hover:bg-primary-500/20"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ConnectWallet />
    </aside>
  );
};

export default Sidebar;
