import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

export interface TurnstileCaptchaRef {
  reset: () => void;
}

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  ({ siteKey, onVerify, onError, onExpire, className, theme = 'auto', size = 'normal' }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>();

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      }
    }));

    return (
      <div className={className}>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={onVerify}
          onError={onError}
          onExpire={onExpire}
          options={{
            theme,
            size,
            refreshExpired: 'auto',
          }}
        />
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';