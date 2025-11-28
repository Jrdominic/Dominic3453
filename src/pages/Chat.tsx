import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/ChatInterface';
import { CodePanel } from '@/components/CodePanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Code } from 'lucide-react';

const Chat = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPrompt] = useState<string | undefined>(location.state?.prompt);
  const [generatedCode, setGeneratedCode] = useState({ code: '', type: 'html' as 'html' | 'react', title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [fixErrorsPrompt, setFixErrorsPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const getUserFirstName = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
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
    setFixErrorsPrompt(`Fix these errors in the code:\n${errorSummary}`);
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
          {/* Sign Out button removed */}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[400px] border-r flex-shrink-0">
          <ChatInterface 
            initialPrompt={initialPrompt} 
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
    </div>
  );
};

export default Chat;