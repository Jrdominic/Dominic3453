import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+${phone}`,
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error("Failed to send code: " + error.message);
    } else {
      toast.success("Verification code sent!");
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith('+') ? phone : `+${phone}`,
      token: otp,
      type: 'sms'
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error("Invalid code: " + error.message);
    } else {
      toast.success("Signed in successfully!");
      onOpenChange(false);
      window.location.href = '/chat';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === "phone" ? "Sign in with phone" : "Enter verification code"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "phone" 
              ? "Enter your phone number to receive a verification code" 
              : `We sent a code to ${phone}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-4">
          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-12 text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button
                onClick={() => setStep("phone")}
                variant="ghost"
                className="w-full"
              >
                Change phone number
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
