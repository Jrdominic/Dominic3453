import { Plus, Paperclip, Palette, Mic, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import sLogo from "@/assets/s-logo.png";

const Index = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-4 border-b border-border">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={sLogo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-foreground">Lovable</span>
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
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
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
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl whitespace-nowrap">
              Build something <img src={sLogo} alt="Logo" className="inline-block h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 align-middle mx-2 sm:mx-3 md:mx-4" /> Cortex
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Create apps and websites by chatting with AI
            </p>
          </div>

          {/* Input Box */}
          <div className="mx-auto w-full max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
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
                placeholder="Ask Lovable to create a blog about..."
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

      {/* Community Section */}
      <section className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground">From the Community</h2>
          </div>
          
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 justify-center">
            {["Featured", "Discover", "Internal Tools", "Website", "Personal", "Consumer App", "B2B App", "Prototype"].map((tab) => (
              <button
                key={tab}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-colors ${
                  tab === "Featured"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-border/60"
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">Project Name</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Website</span>
                    <span>•</span>
                    <span>24 Remixes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
