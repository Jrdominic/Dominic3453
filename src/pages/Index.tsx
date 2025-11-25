import { Plus, Paperclip, Palette, Mic, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import sLogo from "@/assets/s-logo.png";
import AnimatedBackground from "@/components/AnimatedBackground";

const Index = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-4 border-b border-border relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={sLogo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold gradient-cortex">Cortex</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Enterprise
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Community
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm">
              Log in
            </Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90 text-sm">
              Get started
            </Button>
          </div>
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
                  className="h-9 w-9 rounded-full bg-muted text-foreground hover:bg-muted/80"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
