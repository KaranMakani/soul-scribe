import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";

import { connectNearWallet } from "@/lib/near";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const ConnectWallet = () => {
  const { isAuthenticated, nearWallet, login, logout } = useAuth();

  const handleDisconnect = async () => {
    await logout();
  };

  if (isAuthenticated && nearWallet) {
    // Show connected wallet
    return (
      <div className="mt-auto">
        <div className="bg-dark-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-light-300">Connected Wallet</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-success"></span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-light-300 font-mono">{nearWallet}</div>
              <div className="text-xs font-mono text-light-300/60">
                {nearWallet.includes('near') 
                  ? `0x${nearWallet.substring(0, 4)}...${nearWallet.substring(nearWallet.length - 4)}`
                  : "0x71...3a2f"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="text-secondary-400 hover:text-secondary-300 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

export default ConnectWallet;
