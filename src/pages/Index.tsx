import { Plus, Paperclip, Palette, Mic, ArrowUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import sLogo from "@/assets/s-logo.png";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(true); // State to control AuthDialog mode
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useScrollAnimation();
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // If user is already signed in, redirect to chat
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/chat');
    }
  }, [user, isLoading, navigate]);

  const handleSendClick = () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    if (user) {
      navigate('/chat', { state: { prompt: inputValue } });
    } else {
      // If not logged in, prompt to log in via the buttons, or just let them type a prompt
      // For now, if not logged in, we'll just show a toast and expect them to use the buttons.
      toast.info("Please log in or sign up to use Cortex.");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setInputValue("");
  };

  const getUserFirstName = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    return fullName.split(' ')[0];
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={sLogo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold gradient-cortex">Cortex</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium">{getUserFirstName()}'s Cortex</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSignUpMode(false);
                  setAuthDialogOpen(true);
                }}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsSignUpMode(true);
                  setAuthDialogOpen(true);
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-3xl space-y-8 text-center">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge className="gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1">
              <span className="text-xs font-medium">New</span>
              <span className="text-xs">Themes & Visual edits</span>
              <span>→</span>
            </Badge>
          </div>

          {/* Heading */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-float">
              Build something
            </h1>
            <div className="flex justify-center animate-float">
              <img src={sLogo} alt="Logo" className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40" />
            </div>
          </div>

          {/* Input Box */}
          <div className="mx-auto w-full max-w-2xl animate-fade-in animate-float">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all hover:border-border/60 focus-within:border-primary/50 hover:shadow-xl hover:-translate-y-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                <Plus className="h-5 w-5" />
              </Button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendClick();
                  }
                }}
                placeholder="Ask Cortex to create a blog about..."
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  <Palette className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  <Mic className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  onClick={handleSendClick}
                  className="h-9 w-9 rounded-full bg-muted text-foreground hover:bg-muted/80"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How it works Section */}
      <section ref={howItWorksRef} className="border-t border-border px-6 py-16 relative z-10">
        <div className="mx-auto max-w-7xl">
          <h2 className={`text-4xl font-bold text-center text-foreground mb-12 transition-opacity duration-700 ${howItWorksVisible ? 'opacity-100 animate-float' : 'opacity-0'}`}>
            How it works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - Describe */}
            <div className={`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-primary/50 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-primary text-5xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Describe</h3>
              <p className="text-muted-foreground">
                Tell the AI what features you want in plain English.
              </p>
            </div>

            {/* Card 2 - AI Modifies Code */}
            <div className={`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-purple/50 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-purple text-5xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI Modifies Code</h3>
              <p className="text-muted-foreground">
                The AI instantly writes and modifies your project's codebase.
              </p>
            </div>

            {/* Card 3 - Preview & Export */}
            <div className={`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-primary/50 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-primary text-5xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Preview & Export</h3>
              <p className="text-muted-foreground">
                See live changes, then export your complete project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 SlushCortex. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} initialIsSignUp={isSignUpMode} />
    </div>
  );
};

export default Index;