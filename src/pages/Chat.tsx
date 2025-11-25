import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChatInterface } from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Chat = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialPrompt] = useState<string | undefined>(location.state?.prompt);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserFirstName = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    return fullName.split(' ')[0];
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/src/assets/cortex-logo.png" alt="Cortex" className="h-8 w-8" />
            <span className="text-xl font-bold">{getUserFirstName()}'s Cortex</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r">
          <ChatInterface initialPrompt={initialPrompt} />
        </div>
        
        <div className="w-1/2 bg-muted/30">
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">App Preview</h2>
              <p className="text-muted-foreground">
                Your generated app will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
