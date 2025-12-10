import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Copy, Check, Code } from 'lucide-react';
import { toast } from 'sonner';

interface SourceFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

const sourceFiles: SourceFile[] = [
  {
    name: 'App.tsx',
    path: 'src/App.tsx',
    language: 'tsx',
    content: `import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;`
  },
  {
    name: 'main.tsx',
    path: 'src/main.tsx',
    language: 'tsx',
    content: `import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);`
  },
  {
    name: 'index.css',
    path: 'src/index.css',
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. All colors MUST be HSL. */
@layer base {
  :root {
    --background: 0 0% 0%;
    --foreground: 0 0% 100%;
    --card: 0 0% 5%;
    --card-foreground: 0 0% 100%;
    --popover: 0 0% 5%;
    --popover-foreground: 0 0% 100%;
    --primary: 270 80% 60%;
    --primary-foreground: 0 0% 100%;
    --purple: 270 80% 60%;
    --purple-light: 270 70% 70%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 60%;
    --accent: 270 80% 60%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 20%;
    --input: 0 0% 10%;
    --ring: 270 80% 60%;
    --radius: 0.75rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
 
  .dark {
    --background: 0 0% 0%;
    --foreground: 0 0% 100%;
    --card: 0 0% 5%;
    --card-foreground: 0 0% 100%;
    --popover: 0 0% 5%;
    --popover-foreground: 0 0% 100%;
    --primary: 270 80% 60%;
    --primary-foreground: 0 0% 100%;
    --purple: 270 80% 60%;
    --purple-light: 270 70% 70%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 60%;
    --accent: 270 80% 60%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 20%;
    --input: 0 0% 10%;
    --ring: 270 80% 60%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .gradient-cortex {
    background: linear-gradient(90deg, hsl(270, 100%, 65%) 0%, hsl(260, 100%, 55%) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px hsl(270, 100%, 65%)) drop-shadow(0 0 40px hsl(270, 100%, 55%));
    animation: pulse-glow 3s ease-in-out infinite;
  }
}`
  },
  {
    name: 'Index.tsx',
    path: 'src/pages/Index.tsx',
    language: 'tsx',
    content: `import { Plus, Paperclip, Palette, Mic, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import sLogo from "@/assets/s-logo.png";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { SourceCodeDialog } from "@/components/SourceCodeViewer";
import { toast } from "sonner";

const Index = () => {
  const [inputValue, setInputValue] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useScrollAnimation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/chat');
    }
  }, [user, isLoading, navigate]);

  const handleSendClick = () => {
    if (!inputValue.trim() && !selectedImage) {
      toast.error('Please enter a prompt or attach an image');
      return;
    }
    if (user) {
      navigate('/chat', { state: { prompt: inputValue, image: selectedImage } });
    } else {
      toast.info("Please log in or sign up to use Cortex.");
    }
  };

  const handleClipClick = () => {
    fileInputRef.current?.click();
  };

  const readImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      toast.success('Image successfully attached', { icon: '✅' });
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readImageFile(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            readImageFile(file);
            event.preventDefault();
            return;
          }
        }
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const getUserFirstName = () => {
    if (!user) return '';
    const fullName = user.full_name || user.email?.split('@')[0] || 'User';
    return fullName.split(' ')[0];
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <AnimatedBackground />
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
            <SourceCodeDialog />
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium">{getUserFirstName()}'s Cortex</span>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => {
                setIsSignUpMode(false);
                setAuthDialogOpen(true);
              }}>
                Login
              </Button>
              <Button size="sm" onClick={() => {
                setIsSignUpMode(true);
                setAuthDialogOpen(true);
              }}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <div className="flex justify-center">
            <Badge className="gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1">
              <span className="text-xs font-medium">New</span>
              <span className="text-xs">Themes & Visual edits</span>
              <span>→</span>
            </Badge>
          </div>
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-float">
              Build something
            </h1>
            <div className="flex justify-center animate-float">
              <img src={sLogo} alt="Logo" className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40" />
            </div>
          </div>
          <div className="mx-auto w-full max-w-2xl animate-fade-in animate-float">
            {selectedImage && (
              <div className="relative mb-4 p-2 border rounded-md bg-muted flex items-center justify-between">
                <img src={selectedImage} alt="Pasted" className="max-h-24 rounded-md object-contain" />
                <Button variant="ghost" size="icon" onClick={removeSelectedImage} className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg transition-all hover:border-border/60 focus-within:border-primary/50 hover:shadow-xl hover:-translate-y-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-transparent">
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
                onPaste={handlePaste}
                placeholder="Ask Cortex to create a blog about..."
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  onClick={handleClipClick}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent">
                  <Palette className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent">
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
      <section ref={howItWorksRef} className="border-t border-border px-6 py-16 relative z-10">
        <div className="mx-auto max-w-7xl">
          <h2 className={\`text-4xl font-bold text-center text-foreground mb-12 \${howItWorksVisible ? 'animate-fade-in animate-float' : 'opacity-0'}\`}>
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={\`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-primary/50 \${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}\`}>
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
            <div className={\`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-purple/50 \${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}\`}>
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
            <div className={\`rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center space-y-4 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:border-primary/50 \${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}\`}>
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

export default Index;`
  },
  {
    name: 'Chat.tsx',
    path: 'src/pages/Chat.tsx',
    language: 'tsx',
    content: `import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/ChatInterface';
import { CodePanel } from '@/components/CodePanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Code } from 'lucide-react';
import { AuthDialog } from '@/components/AuthDialog';

const Chat = () => {
  const { user, isLoading, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPrompt] = useState<string | undefined>(location.state?.prompt);
  const [initialImage] = useState<string | undefined>(location.state?.image);
  const [generatedCode, setGeneratedCode] = useState({ code: '', type: 'html' as 'html' | 'react', title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [fixErrorsPrompt, setFixErrorsPrompt] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const getUserFirstName = () => {
    if (!user) return '';
    const fullName = user.full_name || user.email?.split('@')[0] || 'User';
    return fullName.split(' ')[0];
  };

  const handleCodeGenerated = (codeData: { code: string; type: 'html' | 'react'; title: string; description: string }) => {
    setGeneratedCode(codeData);
    setIsGenerating(false);
    setActiveTab('preview');
  };

  const handleGeneratingStart = () => {
    setIsGenerating(true);
  };

  const handleFixErrors = (errors: string[]) => {
    const errorSummary = errors.join('\n');
    setFixErrorsPrompt(\`Fix these errors in the code:
\${errorSummary}\`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const language = generatedCode.type === 'react' ? 'tsx' : 'markup';

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/src/assets/cortex-logo.png" alt="Cortex" className="h-8 w-8" />
            <span className="text-xl font-bold">{getUserFirstName()}'s Cortex</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAuthDialogOpen(true)}>
            Account
          </Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[400px] border-r flex-shrink-0">
          <ChatInterface
            initialPrompt={initialPrompt}
            initialImage={initialImage}
            onCodeGenerated={handleCodeGenerated}
            onGeneratingStart={handleGeneratingStart}
            fixErrorsPrompt={fixErrorsPrompt}
            onFixErrorsHandled={() => setFixErrorsPrompt(null)}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="preview" className="gap-2">
                  <Monitor className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code className="h-4 w-4" />
                  Code
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
              <PreviewPanel
                code={generatedCode.code}
                type={generatedCode.type}
                isLoading={isGenerating}
                onFixErrors={handleFixErrors}
              />
            </TabsContent>
            <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
              <CodePanel
                code={generatedCode.code}
                language={language}
                title={generatedCode.title}
                fileName={generatedCode.type === 'react' ? 'App.tsx' : 'index.html'}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} initialIsSignUp={false} />
    </div>
  );
};

export default Chat;`
  },
  {
    name: 'ChatInterface.tsx',
    path: 'src/components/ChatInterface.tsx',
    language: 'tsx',
    content: `import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateCode } from '@/utils/aiApi';

interface Message {
  role: 'user' | 'assistant' | 'status';
  content: string;
  image?: string;
}

interface ChatInterfaceProps {
  initialPrompt?: string;
  initialImage?: string;
  onCodeGenerated: (codeData: { code: string; type: 'html' | 'react'; title: string; description: string }) => void;
  onGeneratingStart: () => void;
  fixErrorsPrompt?: string | null;
  onFixErrorsHandled?: () => void;
}

export const ChatInterface = ({
  initialPrompt,
  initialImage,
  onCodeGenerated,
  onGeneratingStart,
  fixErrorsPrompt,
  onFixErrorsHandled
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<Array<{ role: string; content: string; image?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt || initialImage) {
      setSelectedImage(initialImage || null);
      sendMessage(initialPrompt, initialImage);
    }
  }, [initialPrompt, initialImage]);

  useEffect(() => {
    if (fixErrorsPrompt) {
      setMessages(prev => [...prev, { role: 'status', content: 'Fixing Errors' }]);
      setTimeout(() => {
        sendMessage(fixErrorsPrompt);
        onFixErrorsHandled?.();
      }, 100);
    }
  }, [fixErrorsPrompt]);

  const sendMessage = async (messageText?: string, imageToSend?: string) => {
    const text = messageText || input;
    const currentImage = imageToSend || selectedImage;

    if ((!text.trim() && !currentImage) || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      ...(currentImage && { image: currentImage })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);
    onGeneratingStart();
    setMessages(prev => [...prev, { role: 'status', content: 'Working On Task' }]);

    try {
      const data = await generateCode({
        prompt: text,
        conversationHistory: conversationHistoryRef.current,
        image: currentImage
      });

      setMessages(prev => prev.filter(m => m.role !== 'status'));

      const assistantMsg: Message = {
        role: 'assistant',
        content: \`Created: \${data.title}
\${data.description}\`
      };

      setMessages(prev => [...prev, assistantMsg]);

      conversationHistoryRef.current.push(
        { role: 'user', content: text, ...(currentImage && { image: currentImage }) },
        { role: 'assistant', content: \`Generated \${data.type} code: \${data.title}\` }
      );

      onCodeGenerated({
        code: data.code,
        type: data.type,
        title: data.title,
        description: data.description
      });
    } catch (e: any) {
      console.error(e);
      setMessages(prev => prev.filter(m => m.role !== 'status'));
      toast.error(e.message || 'Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readImageFile(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            readImageFile(file);
            event.preventDefault();
            return;
          }
        }
      }
    }
  };

  const readImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      toast.success('Image successfully attached', { icon: '✅' });
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <h3 className="text-lg font-semibold mb-2">Start building</h3>
            <p>Describe what you want to create</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={\`flex \${msg.role === 'user' ? 'justify-end' : msg.role === 'status' ? 'justify-center' : 'justify-start'}\`}
          >
            <div
              className={\`max-w-[80%] rounded-lg px-4 py-2 \${msg.role === 'user' ? 'bg-primary text-primary-foreground' : msg.role === 'status' ? 'bg-accent/20 text-accent-foreground flex items-center gap-2' : 'bg-muted text-foreground'}\`}
            >
              {msg.role === 'status' && <Loader2 className="h-4 w-4 animate-spin" />}
              {msg.image && (
                <img src={msg.image} alt="User uploaded" className="max-w-full h-auto rounded-md mb-2" />
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        {selectedImage && (
          <div className="relative mb-4 p-2 border rounded-md bg-muted flex items-center justify-between">
            <img src={selectedImage} alt="Pasted" className="max-h-24 rounded-md object-contain" />
            <Button
              variant="ghost"
              size="icon"
              onClick={removeSelectedImage}
              className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onPaste={handlePaste}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};`
  },
  {
    name: 'CodePanel.tsx',
    path: 'src/components/CodePanel.tsx',
    language: 'tsx',
    content: `import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import { Button } from './ui/button';
import { Copy, Check, Code } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CodePanelProps {
  code: string;
  language: string;
  title?: string;
  fileName?: string;
}

export const CodePanel = ({ code, language, title, fileName = 'index.html' }: CodePanelProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  if (!code) {
    return (
      <div className="h-full flex">
        {/* File Tree */}
        <div className="w-64 border-r bg-muted/30 p-4">
          <div className="text-sm font-semibold mb-4 text-muted-foreground">Files</div>
          <div className="text-sm text-muted-foreground">
            No files generated yet
          </div>
        </div>
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">
            Generated code will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* File Tree */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="text-sm font-semibold mb-4">Files</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer bg-muted">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
        </div>
      </div>
      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 px-4 py-3 bg-background/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">{fileName}</h2>
            {title && <p className="text-xs text-muted-foreground">{title}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="!m-0 !rounded-none h-full" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            <code ref={codeRef} className={\`language-\${language}\`}>
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};`
  },
  {
    name: 'PreviewPanel.tsx',
    path: 'src/components/PreviewPanel.tsx',
    language: 'tsx',
    content: `import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
  code: string;
  type: 'html' | 'react';
  isLoading?: boolean;
  onFixErrors?: (errors: string[]) => void;
}

export const PreviewPanel = ({ code, type, isLoading, onFixErrors }: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setErrors([]);
  };

  const handleFixErrors = () => {
    if (onFixErrors && errors.length > 0) {
      onFixErrors(errors);
    }
  };

  useEffect(() => {
    if (!code) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Listen for errors from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONSOLE_ERROR') {
        setErrors(prev => [...prev, event.data.message]);
      }
    };

    window.addEventListener('message', handleMessage);

    if (type === 'html') {
      iframe.srcdoc = code;
    } else if (type === 'react') {
      const htmlTemplate = \`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    * {
      box-sizing: border-box;
    }
  </style>
  <script>
    // Capture console errors
    window.addEventListener('error', function(e) {
      window.parent.postMessage({ type: 'CONSOLE_ERROR', message: e.message + ' at ' + e.filename + ':' + e.lineno }, '*');
    });
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
      window.parent.postMessage({ type: 'CONSOLE_ERROR', message: 'Unhandled Promise: ' + e.reason }, '*');
    });
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    \${code}
    
    // Auto-detect component - try default export, then look for any function component
    let Component = null;
    if (typeof exports !== 'undefined' && exports.default) {
      Component = exports.default;
    } else {
      // Find any function that looks like a component (starts with capital letter)
      const windowKeys = Object.keys(window);
      for (let key of windowKeys) {
        if (key[0] === key[0].toUpperCase() && typeof window[key] === 'function') {
          Component = window[key];
          break;
        }
      }
    }
    
    if (Component) {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(Component));
    } else {
      document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: No component found</div>';
      window.parent.postMessage({ type: 'CONSOLE_ERROR', message: 'No React component found in generated code' }, '*');
    }
  </script>
</body>
</html>\`;
      iframe.srcdoc = htmlTemplate;
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [code, type, refreshKey]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Working On Task</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white relative flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {code && (
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className="shadow-lg"
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      {errors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 p-4 max-h-48 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-800">Console Errors</h3>
            <Button
              onClick={handleFixErrors}
              size="sm"
              variant="destructive"
              className="text-xs"
            >
              Attempt to Fix with AI?
            </Button>
          </div>
          <div className="space-y-1">
            {errors.map((error, idx) => (
              <div key={idx} className="text-xs text-red-700 font-mono bg-red-100 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Preview"
        />
        {!code && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Your generated app will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};`
  },
  {
    name: 'useAuth.tsx',
    path: 'src/hooks/useAuth.tsx',
    language: 'tsx',
    content: `import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setAuthState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { user: null, error: new Error(data.error || 'Sign in failed.') };
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, error: error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { user: null, error: new Error(data.error || 'Sign up failed.') };
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
      });
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, error: error };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${authState.token}\`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: new Error(data.error || 'Account deletion failed.') };
      }
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    deleteAccount,
  };
};`
  },
  {
    name: 'AuthDialog.tsx',
    path: 'src/components/AuthDialog.tsx',
    language: 'tsx',
    content: `"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIsSignUp?: boolean;
}

export const AuthDialog = ({ open, onOpenChange, initialIsSignUp = true }: AuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, deleteAccount, user } = useAuth();

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
      }
    } else {
      authResult = await signIn(email, password);
      if (authResult.error) {
        toast.error(authResult.error.message);
      } else {
        toast.success("Signed in successfully!");
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={setOpenChange}>
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
          <Button onClick={handleAuth} disabled={isLoading} className="w-full h-12">
            {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
          <Button onClick={() => setIsSignUp(!isSignUp)} variant="ghost" className="w-full">
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </Button>
        </div>
        {user && (
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
};`
  },
  {
    name: 'aiApi.ts',
    path: 'src/utils/aiApi.ts',
    language: 'ts',
    content: `interface GenerateCodePayload {
  prompt: string;
  conversationHistory: Array<{ role: string; content: string; image?: string }>;
  image?: string;
}

interface GenerateCodeResponse {
  code: string;
  type: 'html' | 'react';
  title: string;
  description: string;
}

export const generateCode = async (payload: GenerateCodePayload): Promise<GenerateCodeResponse> => {
  const token = localStorage.getItem('token'); // Get token from local storage
  
  const response = await fetch('/api/generate-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': \`Bearer \${token}\` }), // Add token if available
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate code from AI.');
  }
  
  return response.json();
};`
  },
  {
    name: 'AnimatedBackground.tsx',
    path: 'src/components/AnimatedBackground.tsx',
    language: 'tsx',
    content: `import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particleCount = 50;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 2,
    }));

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx -= (dx / distance) * force * 0.2;
          particle.vy -= (dy / distance) * force * 0.2;
        }

        // Limit velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > 2) {
          particle.vx = (particle.vx / speed) * 2;
          particle.vy = (particle.vy / speed) * 2;
        }

        // Draw particle with purple gradient
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.8)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach((otherParticle, j) => {
          if (i === j) return;

          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = \`rgba(168, 85, 247, \${0.2 * (1 - distance / 100)})\`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default AnimatedBackground;`
  },
  {
    name: 'useScrollAnimation.tsx',
    path: 'src/hooks/useScrollAnimation.tsx',
    language: 'tsx',
    content: `import { useEffect, useRef, useState } from "react";

export const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};`
  },
  {
    name: 'NavLink.tsx',
    path: 'src/components/NavLink.tsx',
    language: 'tsx',
    content: `import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };`
  }
];

export const SourceCodeViewer = () => {
  const [activeFile, setActiveFile] = useState<SourceFile>(sourceFiles[0]);
  const [copied, setCopied] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyFile = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      toast.success('File copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy file');
    }
  };

  const handleCopyAll = async () => {
    try {
      // Create a single string with all files and their content
      const allCode = sourceFiles.map(file => 
        '/* === ' + file.path + ' === */\n' + file.content
      ).join('\n\n');
      
      await navigator.clipboard.writeText(allCode);
      setAllCopied(true);
      toast.success('All code copied to clipboard');
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy all code');
    }
  };

  return (
    <div className="h-[80vh] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Project Files</h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCopyAll}
                className="gap-2 text-xs transition-all duration-300 hover:scale-105"
              >
                {allCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {allCopied ? 'Copied!' : 'Copy All'}
              </Button>
            </div>
            <div className="space-y-1 animate-fade-in">
              {sourceFiles.map((file, index) => (
                <button
                  key={file.path}
                  className={'w-full text-left px-2 py-1.5 rounded text-sm transition-all duration-200 hover:scale-[1.02] ' + (activeFile.path === file.path ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted')}
                  onClick={() => setActiveFile(file)}
                  style={{ animationDelay: (index * 50) + 'ms' }}
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Code Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4 py-3 bg-background/50 flex items-center justify-between animate-slide-down">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Code className="h-4 w-4" />
                {activeFile.path}
              </h2>
              <p className="text-xs text-muted-foreground">Click to copy file content</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyFile}
              className="gap-2 transition-all duration-300 hover:scale-105"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden bg-muted/20 animate-fade-in">
            <pre className="h-full overflow-auto p-4 text-sm" style={{ lineHeight: '1.5' }}>
              <code className="font-mono whitespace-pre">
                {activeFile.content}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SourceCodeDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
          Source Code
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden rounded-lg shadow-2xl animate-zoom-in">
        <div className="h-full flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Project Source Code
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <SourceCodeViewer />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};