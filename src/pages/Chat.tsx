import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatInterface } from '@/components/ChatInterface';
import { CodePanel } from '@/components/CodePanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Code } from 'lucide-react';
import { useGuestUser } from '@/hooks/useGuestUser'; // Import useGuestUser

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPrompt] = useState<string | undefined>(location.state?.prompt);
  const [generatedCode, setGeneratedCode] = useState({ code: '', type: 'html' as 'html' | 'react', title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [fixErrorsPrompt, setFixErrorsPrompt] = useState<string | null>(null);
  const { userName, isLoading: isGuestLoading } = useGuestUser(); // Use useGuestUser

  useEffect(() => {
    // If guest user data is still loading, wait.
    // If no userName is found after loading, redirect to home to prompt for name.
    if (!isGuestLoading && !userName) {
      navigate('/');
    }
  }, [userName, isGuestLoading, navigate]);

  const handleCodeGenerated = (codeData: { code: string; type: 'html' | 'react'; title: string; description: string }) => {
    setGeneratedCode(codeData);
    setIsGenerating(false);
    // Automatically switch to preview when code is generated
    setActiveTab('preview');
  };

  const handleGeneratingStart = () => {
    setIsGenerating(true);
  };

  const handleFixErrors = (errors: string[]) => {
    const errorSummary = errors.join('\n');
    setFixErrorsPrompt(`Fix these errors in the code:\n${errorSummary}`);
  };

  if (isGuestLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If userName is null after loading, it means the user hasn't entered a name yet.
  // The useEffect above will handle the redirect, so we can return null here.
  if (!userName) return null;

  const language = generatedCode.type === 'react' ? 'tsx' : 'markup';

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/src/assets/cortex-logo.png" alt="Cortex" className="h-8 w-8" />
            <span className="text-xl font-bold">{userName}'s Cortex</span>
          </div>
          {/* No sign-out button as per request */}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Fixed Left Side */}
        <div className="w-[400px] border-r flex-shrink-0">
          <ChatInterface 
            initialPrompt={initialPrompt} 
            onCodeGenerated={handleCodeGenerated}
            onGeneratingStart={handleGeneratingStart}
            fixErrorsPrompt={fixErrorsPrompt}
            onFixErrorsHandled={() => setFixErrorsPrompt(null)}
          />
        </div>
        
        {/* Main Content Area with Tabs */}
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
    </div>
  );
};

export default Chat;