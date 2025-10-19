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
  Img,
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
        {/* Header with gradient background */}
        <Section style={headerSection}>
          <div style={logoContainer}>
            <Text style={logoText}>Exhibit3Design</Text>
          </div>
          <Heading style={h1}>Verification Code</Heading>
          <Text style={headerSubtext}>
            Secure access to AI-powered exhibition design
          </Text>
        </Section>

        {/* Main content */}
        <Section style={contentSection}>
          <Text style={welcomeText}>Hello,</Text>
          <Text style={instructionText}>
            Your verification code is ready. Enter the code below to complete your authentication:
          </Text>

          {/* OTP Code Box */}
          <div style={otpContainer}>
            <Text style={otpCode}>{otp}</Text>
          </div>

          <Text style={expiryText}>
            ⏱️ This code will expire in <strong>2 minutes</strong>
          </Text>

          {/* Value Proposition */}
          <Section style={valueSection}>
            <Hr style={divider} />
            <Text style={valueHeading}>
              🎨 Why Choose Exhibit3Design?
            </Text>
            <Text style={valueText}>
              Transform your exhibition stands with AI-powered design tools. From concept to reality, 
              create stunning 3D visualizations, generate photorealistic renders, and bring visitors 
              to life in your designs—all powered by cutting-edge artificial intelligence.
            </Text>
            <div style={featureList}>
              <Text style={featureItem}>✨ AI Image Enhancement & Magic Edit</Text>
              <Text style={featureItem}>🎬 Text-to-Video Generation</Text>
              <Text style={featureItem}>👥 Virtual Visitor Integration</Text>
              <Text style={featureItem}>🔄 360° Stand Rotation</Text>
            </div>
          </Section>

          {/* Security notice */}
          <Section style={securitySection}>
            <Text style={securityText}>
              🔒 <strong>Security Notice:</strong> If you didn't request this code, 
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
            AI-Powered Exhibition Stand Design Platform
            <br />
            <a href="https://exhibit3design.com" style={link}>exhibit3design.com</a> 
            {' | '}
            <a href="https://ai.exhibit3design.com" style={link}>ai.exhibit3design.com</a>
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

// Styles matching the Exhibit3Design brand
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
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
};

const headerSection = {
  background: 'linear-gradient(135deg, hsl(260, 84%, 60%) 0%, hsl(262, 83%, 58%) 100%)',
  padding: '40px 32px',
  textAlign: 'center' as const,
};

const logoContainer = {
  marginBottom: '20px',
};

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.5px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '20px 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  margin: '0',
  lineHeight: '1.4',
};

const contentSection = {
  padding: '40px 32px',
};

const welcomeText = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const instructionText = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 32px 0',
};

const otpContainer = {
  backgroundColor: '#f8f9fa',
  border: '2px dashed hsl(260, 84%, 60%)',
  borderRadius: '12px',
  padding: '32px 20px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const otpCode = {
  color: 'hsl(260, 84%, 60%)',
  fontSize: '48px',
  fontWeight: 'bold',
  letterSpacing: '12px',
  margin: '0',
  fontFamily: 'Monaco, "Courier New", monospace',
};

const expiryText = {
  color: '#666666',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
};

const valueSection = {
  marginTop: '40px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const valueHeading = {
  color: 'hsl(260, 84%, 60%)',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 16px 0',
};

const valueText = {
  color: '#666666',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
};

const featureList = {
  margin: '16px 0',
};

const featureItem = {
  color: '#555555',
  fontSize: '14px',
  margin: '8px 0',
  paddingLeft: '8px',
};

const securitySection = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid hsl(262, 83%, 58%)',
  padding: '16px 20px',
  marginTop: '32px',
  borderRadius: '4px',
};

const securityText = {
  color: '#555555',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const footer = {
  padding: '24px 32px',
  backgroundColor: '#f8f9fa',
};

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '0 0 20px 0',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.8',
  textAlign: 'center' as const,
  margin: '0 0 12px 0',
};

const link = {
  color: 'hsl(260, 84%, 60%)',
  textDecoration: 'none',
};

const copyrightText = {
  color: '#999999',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};
