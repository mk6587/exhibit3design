import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export const OTPInput = React.forwardRef<
  React.ElementRef<typeof InputOTP>,
  OTPInputProps
>(({ value, onChange, disabled, error, label, className }, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}
      <InputOTP
        ref={ref}
        maxLength={4}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          error && "ring-2 ring-destructive ring-offset-2"
        )}
      >
        <InputOTPGroup className="gap-2">
          <InputOTPSlot 
            index={0} 
            className={cn(
              "w-12 h-12 text-lg font-semibold border-2",
              error && "border-destructive"
            )}
          />
          <InputOTPSlot 
            index={1} 
            className={cn(
              "w-12 h-12 text-lg font-semibold border-2",
              error && "border-destructive"
            )}
          />
          <InputOTPSlot 
            index={2} 
            className={cn(
              "w-12 h-12 text-lg font-semibold border-2",
              error && "border-destructive"
            )}
          />
          <InputOTPSlot 
            index={3} 
            className={cn(
              "w-12 h-12 text-lg font-semibold border-2",
              error && "border-destructive"
            )}
          />
        </InputOTPGroup>
      </InputOTP>
      {error && (
        <p className="text-sm text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

OTPInput.displayName = "OTPInput";