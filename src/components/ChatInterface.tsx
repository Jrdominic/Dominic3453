import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant' | 'status';
  content: string;
  image?: string; // Added image field
}

interface ChatInterfaceProps {
  initialPrompt?: string;
  initialImage?: string; // Added initialImage prop
  onCodeGenerated: (codeData: { code: string; type: 'html' | 'react'; title: string; description: string }) => void;
  onGeneratingStart: () => void;
  fixErrorsPrompt?: string | null;
  onFixErrorsHandled?: () => void;
}

export const ChatInterface = ({ initialPrompt, initialImage, onCodeGenerated, onGeneratingStart, fixErrorsPrompt, onFixErrorsHandled }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<Array<{ role: string; content: string; image?: string }>>([]); // Updated history type

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt || initialImage) {
      sendMessage(initialPrompt, initialImage);
    }
  }, [initialPrompt, initialImage]); // Depend on initialImage as well

  useEffect(() => {
    if (fixErrorsPrompt) {
      // Add "Fixing Errors" status message
      setMessages(prev => [...prev, { role: 'status', content: 'Fixing Errors' }]);
      setTimeout(() => {
        sendMessage(fixErrorsPrompt);
        onFixErrorsHandled?.();
      }, 100);
    }
  }, [fixErrorsPrompt]);

  const sendMessage = async (messageText?: string, imageToSend?: string) => {
    const text = messageText || input;
    if ((!text.trim() && !imageToSend) || isLoading) return;

    const userMsg: Message = { role: 'user', content: text, ...(imageToSend && { image: imageToSend }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    onGeneratingStart();

    // Add "Working On Task" status
    setMessages(prev => [...prev, { role: 'status', content: 'Working On Task' }]);

    try {
      // Generate code using the new edge function
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { 
          prompt: text,
          conversationHistory: conversationHistoryRef.current,
          image: imageToSend // Pass image data to the edge function
        }
      });

      if (error) throw error;

      // Remove status message
      setMessages(prev => prev.filter(m => m.role !== 'status'));

      // Add assistant response
      const assistantMsg: Message = {
        role: 'assistant',
        content: `Created: ${data.title}\n${data.description}`
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Update conversation history
      conversationHistoryRef.current.push(
        { role: 'user', content: text, ...(imageToSend && { image: imageToSend }) },
        { role: 'assistant', content: `Generated ${data.type} code: ${data.title}` }
      );

      // Trigger code display
      onCodeGenerated({
        code: data.code,
        type: data.type,
        title: data.title,
        description: data.description
      });

    } catch (e) {
      console.error(e);
      setMessages(prev => prev.filter(m => m.role !== 'status'));
      toast.error('Failed to generate code');
    } finally {
      setIsLoading(false);
    }
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
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 
              msg.role === 'status' ? 'justify-center' : 
              'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : msg.role === 'status'
                  ? 'bg-accent/20 text-accent-foreground flex items-center gap-2'
                  : 'bg-muted text-foreground'
              }`}
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
            placeholder="Describe what you want to build..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || (!input.trim() && !initialImage)} // Disable if no text and no initial image
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};