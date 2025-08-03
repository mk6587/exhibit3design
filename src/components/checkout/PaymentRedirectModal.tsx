import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Shield, Lock } from "lucide-react";

interface PaymentRedirectModalProps {
  isOpen: boolean;
  paymentGateway?: string;
}

const PaymentRedirectModal = ({ isOpen, paymentGateway = "our secure payment gateway" }: PaymentRedirectModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center space-y-6 py-8">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Redirecting to Secure Payment</h3>
            <p className="text-muted-foreground">Please wait while we redirect you to {paymentGateway}...</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Lock className="w-4 h-4" />
              <span className="font-medium text-sm">Your information is secure</span>
            </div>
            <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
              <li>• SSL encrypted payment processing</li>
              <li>• Your data is never stored on our servers</li>
              <li>• Bank-level security standards</li>
            </ul>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            If you're not redirected automatically, please wait a moment or check your browser settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRedirectModal;