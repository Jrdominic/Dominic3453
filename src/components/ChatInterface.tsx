import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateCode } from '@/utils/aiApi'; // Import the new AI API utility

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

export const ChatInterface = ({ initialPrompt, initialImage, onCodeGenerated, onGeneratingStart, fixErrorsPrompt, onFixErrorsHandled }: ChatInterfaceProps) => {
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

    const userMsg: Message = { role: 'user', content: text, ...(currentImage && { image: currentImage }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);
    onGeneratingStart();

    setMessages(prev => [...prev, { role: 'status', content: 'Working On Task' }]);

    try {
      const data = await generateCode({ // Use the new generateCode utility
        prompt: text,
        conversationHistory: conversationHistoryRef.current,
        image: currentImage
      });

      setMessages(prev => prev.filter(m => m.role !== 'status'));

      const assistantMsg: Message = {
        role: 'assistant',
        content: `Created: ${data.title}\n${data.description}`
      };
      setMessages(prev => [...prev, assistantMsg]);

      conversationHistoryRef.current.push(
        { role: 'user', content: text, ...(currentImage && { image: currentImage }) },
        { role: 'assistant', content: `Generated ${data.type} code: ${data.title}` }
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
        {selectedImage && (
          <div className="relative mb-4 p-2 border rounded-md bg-muted flex items-center justify-between">
            <img src={selectedImage} alt="Pasted" className="max-h-24 rounded-md object-contain" />
            <Button variant="ghost" size="icon" onClick={removeSelectedImage} className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground">
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
};