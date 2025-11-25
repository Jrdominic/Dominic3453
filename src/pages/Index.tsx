import { Check, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import sLogo from "@/assets/s-logo.png";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { motion } from "framer-motion";
import { GenerationChat } from "@/components/GenerationChat";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [proPrice, setProPrice] = useState(20);
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useScrollAnimation();
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollAnimation();

  useEffect(() => {
    const targetPrice = isYearly ? 192 : 20;
    const startPrice = proPrice;
    const duration = 1500;
    const steps = 80;
    const increment = (targetPrice - startPrice) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setProPrice(targetPrice);
        clearInterval(timer);
      } else {
        setProPrice(Math.round(startPrice + increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isYearly]);

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src={sLogo} alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-semibold gradient-cortex">Cortex</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </button>
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {credits && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-bold text-primary">{credits.credits_remaining}/{credits.daily_credits}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" title="Profile">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Log in
              </Button>
              <Button onClick={() => navigate('/auth')}>Get Started</Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-4xl space-y-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Badge className="gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1">
              <span className="text-xs font-medium">New</span>
              <span className="text-xs">AI-Powered App Generation</span>
              <span>→</span>
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Generate apps with
            <br />
            just a prompt
          </motion.h1>

          {/* Chat Interface or CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            {!user ? (
              <div className="space-y-6">
                <p className="text-xl text-muted-foreground">
                  Sign in to start generating AI-powered apps
                </p>
                <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                  Get Started Free - 4 Credits Daily
                </Button>
              </div>
            ) : (
              <GenerationChat />
            )}
          </motion.div>
        </div>
      </main>

      {/* How it works Section */}
      <section ref={howItWorksRef} className="border-t border-border px-6 py-16 relative z-10">
        <div className="mx-auto max-w-7xl">
          <h2 className={`text-4xl font-bold text-center text-foreground mb-12 transition-opacity duration-700 ${howItWorksVisible ? 'opacity-100' : 'opacity-0'}`}>
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
                Tell the AI what app you want to build in plain English.
              </p>
            </div>

            {/* Card 2 - AI Generates */}
            <div className={`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-purple/50 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-purple text-5xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI Generates</h3>
              <p className="text-muted-foreground">
                Our AI instantly creates your complete app with working code.
              </p>
            </div>

            {/* Card 3 - Deploy */}
            <div className={`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-primary/50 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-primary text-5xl">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Preview & Deploy</h3>
              <p className="text-muted-foreground">
                See live changes instantly, then deploy your app to the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="px-6 py-16 relative z-10">
        <div className="mx-auto max-w-7xl">
          <h2 className={`text-4xl font-bold text-center text-foreground mb-4 transition-opacity duration-700 ${pricingVisible ? 'opacity-100' : 'opacity-0'}`}>
            Simple, transparent pricing
          </h2>
          <p className={`text-center text-muted-foreground mb-8 transition-opacity duration-700 ${pricingVisible ? 'opacity-100' : 'opacity-0'}`}>
            Choose the plan that's right for you
          </p>

          {/* Billing Toggle */}
          <div className={`flex items-center justify-center gap-3 mb-12 transition-opacity duration-700 ${pricingVisible ? 'opacity-100' : 'opacity-0'}`}>
            <span className={`text-sm ${!isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Save 20%
              </Badge>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className={`rounded-2xl border border-border bg-card p-8 flex flex-col transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-border/60 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
              <div className="mb-6 h-16 flex items-baseline">
                <span className="text-5xl font-bold text-foreground">
                  $0
                </span>
                <span className="text-muted-foreground ml-2">/{isYearly ? 'year' : 'month'}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">4 daily credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Basic features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Community support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Public projects</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                Get started
              </Button>
            </div>

            {/* Pro Tier */}
            <div className={`rounded-2xl border-2 border-primary bg-card p-8 flex flex-col relative transition-all duration-700 hover:scale-105 hover:shadow-2xl ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold z-20">
                50% OFF
              </div>
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Popular
              </Badge>
              <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
              <div className="mb-6 h-16 flex items-baseline">
                <span className="text-5xl font-bold text-foreground">
                  ${proPrice}
                </span>
                <span className="text-muted-foreground ml-2">/{isYearly ? 'year' : 'month'}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Unlimited credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">All features included</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Private projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Custom domain</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Cloud integration</span>
                </li>
              </ul>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Cortex. All rights reserved.
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
    </div>
  );
};

export default Index;
