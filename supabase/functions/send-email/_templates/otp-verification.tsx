import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface OTPVerificationEmailProps {
  otp: string;
  email: string;
}

export const OTPVerificationEmail = ({
  otp,
  email,
}: OTPVerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your verification code: {otp}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Text style={logoText}>Exhibit3Design</Text>
          <Heading style={h1}>Email Verification</Heading>
        </Section>

        {/* Main content */}
        <Section style={contentSection}>
          <Text style={greetingText}>Hello,</Text>
          <Text style={instructionText}>
            To complete your sign-in, please enter this verification code:
          </Text>

          {/* OTP Code Box */}
          <div style={otpContainer}>
            <Text style={otpCode}>{otp}</Text>
          </div>

          <Text style={expiryText}>
            This code expires in <strong>5 minutes</strong>
          </Text>

          {/* Security notice */}
          <Section style={securitySection}>
            <Text style={securityText}>
              <strong>Security Notice:</strong> If you didn't request this code, 
              please ignore this email. Your account remains secure.
            </Text>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Hr style={footerDivider} />
          <Text style={footerText}>
            <strong>Exhibit3Design</strong>
            <br />
            AI-Powered Exhibition Stand Design
            <br />
            exhibit3design.com
          </Text>
          <Text style={copyrightText}>
            © {new Date().getFullYear()} Exhibit3Design. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OTPVerificationEmail;

// Clean, professional styles
const main = {
  backgroundColor: '#f8f9fa',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginTop: '20px',
  marginBottom: '20px',
  borderRadius: '8px',
  overflow: 'hidden',
  maxWidth: '600px',
  border: '1px solid #e5e7eb',
};

const headerSection = {
  background: 'linear-gradient(135deg, hsl(260, 84%, 60%) 0%, hsl(262, 83%, 58%) 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  letterSpacing: '-0.5px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1.2',
};

const contentSection = {
  padding: '32px 24px',
};

const greetingText = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px 0',
};

const instructionText = {
  color: '#666666',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0 0 24px 0',
};

const otpContainer = {
  backgroundColor: '#f8f9fa',
  border: '2px solid hsl(260, 84%, 60%)',
  borderRadius: '8px',
  padding: '24px 16px',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const otpCode = {
  color: 'hsl(260, 84%, 60%)',
  fontSize: '36px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  margin: '0',
  fontFamily: 'Monaco, "Courier New", monospace',
};

const expiryText = {
  color: '#666666',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const securitySection = {
  backgroundColor: '#f8f9fa',
  borderLeft: '3px solid hsl(262, 83%, 58%)',
  padding: '12px 16px',
  borderRadius: '4px',
};

const securityText = {
  color: '#555555',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const footer = {
  padding: '20px 24px',
  backgroundColor: '#f8f9fa',
};

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '0 0 16px 0',
};

const footerText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
};

const copyrightText = {
  color: '#999999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};