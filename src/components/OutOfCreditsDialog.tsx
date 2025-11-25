import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OutOfCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OutOfCreditsDialog = ({ open, onOpenChange }: OutOfCreditsDialogProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/#pricing');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Your Out of Credits For the Day
          </DialogTitle>
          <DialogDescription className="text-center text-lg pt-4">
            Want To Generate more?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 pt-4">
          <Button onClick={handleUpgrade} size="lg" className="w-full">
            Subscribe for Our Cheap 50% off Pro Plan
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" size="lg" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
