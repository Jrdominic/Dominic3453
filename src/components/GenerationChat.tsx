import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { OutOfCreditsDialog } from './OutOfCreditsDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const GenerationChat = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const { user } = useAuth();
  const { credits, deductCredit } = useCredits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to generate apps');
      return;
    }

    if (!prompt.trim()) return;

    if (!credits || credits.credits_remaining <= 0) {
      setShowOutOfCredits(true);
      return;
    }

    setLoading(true);

    try {
      // Deduct credit
      const success = await deductCredit();
      if (!success) {
        setShowOutOfCredits(true);
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt
      };
      setMessages(prev => [...prev, userMessage]);

      // Save generation to database
      await supabase.from('generations').insert({
        user_id: user.id,
        prompt: prompt,
        status: 'completed'
      });

      // Simulate AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great! I'll help you generate an app for: "${prompt}". Your app is being created with AI magic! ✨`
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 1000);

      setPrompt('');
      toast.success('Generation started!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start generation');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Messages Display */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto p-4 bg-card/50 rounded-lg border border-border">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the app you want to generate..."
            className="min-h-[120px] pr-24 text-lg resize-none"
            disabled={loading || !user}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute bottom-4 right-4 h-12 w-12"
            disabled={loading || !prompt.trim() || !user}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {/* Credits Display */}
        {user && credits && (
          <div className="text-center text-sm text-muted-foreground">
            Credits remaining today: <span className="font-bold text-primary">{credits.credits_remaining}/{credits.daily_credits}</span>
          </div>
        )}
      </div>

      <OutOfCreditsDialog open={showOutOfCredits} onOpenChange={setShowOutOfCredits} />
    </>
  );
};
