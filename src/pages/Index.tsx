import { Heart, Paperclip, Palette, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import cortexLogo from "@/assets/cortex-logo.png";

const Index = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-3xl space-y-8 text-center">
        {/* Logo and Heading */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <img 
              src={cortexLogo} 
              alt="Cortex Logo" 
              className="h-10 w-10"
            />
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Build something with Cortex
            </h1>
          </div>
          <p className="text-lg text-muted-foreground md:text-xl">
            Create apps and websites by chatting with AI
          </p>
        </div>

        {/* Chat Input Interface */}
        <div className="relative">
          {/* Heart icon */}
          <div className="absolute -left-4 top-1/2 hidden -translate-y-1/2 md:block">
            <Heart className="h-5 w-5 text-primary" />
          </div>

          {/* Input Container */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-input p-4 transition-colors hover:border-primary/50 focus-within:border-primary">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Cortex to create a web app that..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Palette className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
