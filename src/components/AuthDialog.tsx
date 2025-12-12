"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth"; // Use the updated auth hook

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIsSignUp?: boolean;
  onAuthSuccess?: () => void; // Added new prop
}

export const AuthDialog = ({ open, onOpenChange, initialIsSignUp = true, onAuthSuccess }: AuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, deleteAccount, user } = useAuth(); // Get auth functions and user

  useEffect(() => {
    setIsSignUp(initialIsSignUp);
  }, [initialIsSignUp]);

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    let authResult;
    if (isSignUp) {
      authResult = await signUp(email, password);
      if (authResult.error) {
        toast.error(authResult.error.message);
      } else {
        toast.success("Account created and signed in successfully!");
        onOpenChange(false);
        onAuthSuccess?.(); // Call the callback on success
      }
    } else {
      authResult = await signIn(email, password);
      if (authResult.error) {
        toast.error(authResult.error.message);
      } else {
        toast.success("Signed in successfully!");
        onOpenChange(false);
        onAuthSuccess?.(); // Call the callback on success
      }
    }
    
    setIsLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true);
    const result = await deleteAccount();
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success("Account deleted successfully!");
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Create account" : "Sign in"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp ? "Sign up to get started" : "Welcome back!"}
          </DialogDescription>
          {isSignUp && (
            <DialogDescription className="text-center text-destructive font-semibold mt-2">
              Account Creation is PERMANENT and you won't be able to Sign out.
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              className="h-12"
            />
          </div>

          <Button
            onClick={handleAuth}
            disabled={isLoading}
            className="w-full h-12"
          >
            {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>

          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            variant="ghost"
            className="w-full"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </Button>
        </div>
        {user && ( // Only show delete option if user is logged in
          <DialogFooter className="mt-4">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};