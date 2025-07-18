import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const PasswordResetEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password - Exhibit3Design</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={headerGradient}>
          <Section style={header}>
            <Img
              src="https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/c64f9532-61fc-4214-88d8-ecfd68194905.png"
              width="220"
              height="65"
              alt="Exhibit3Design"
              style={logo}
            />
          </Section>
        </Section>
        
        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>🔑 Reset Your Password</Heading>
          
          <Text style={subtitle}>
            Reset your password to regain access to your account
          </Text>
          
          <Text style={text}>
            We received a request to reset your password for your Exhibit3Design account.
          </Text>
          
          <Text style={text}>
            Click the button below to reset your password:
          </Text>
          
          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              target="_blank"
              style={gradientButton}
            >
              🔑 Reset Your Password
            </Link>
          </Section>
          
          <Text style={alternativeText}>
            If the button doesn't work, copy and paste this link in your browser:
          </Text>
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          </Text>

          <Section style={warningSection}>
            <Text style={warningText}>
              ⚠️ This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
            </Text>
          </Section>
        </Section>
        
        <Hr style={divider} />
        
        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            If you didn't request this password reset, you can safely ignore this email.
          </Text>
          <Text style={footerBrand}>
            <Link
              href="https://exhibit3design.com"
              target="_blank"
              style={footerLink}
            >
              Exhibit3Design
            </Link>
            <br />
            Professional Exhibition Stand Design Files
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f1f5f9',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  paddingLeft: '0px',
  paddingRight: '0px',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '16px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
}

const headerGradient = {
  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%)',
  padding: '0',
}

const header = {
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  filter: 'brightness(0) invert(1)',
}

const content = {
  padding: '50px 40px',
}

const h1 = {
  color: '#1e293b',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: '32px',
  fontWeight: '800',
  margin: '0 0 20px',
  textAlign: 'center' as const,
  lineHeight: '1.2',
}

const subtitle = {
  color: '#8b5cf6',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 40px',
}

const text = {
  color: '#374151',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const gradientButton = {
  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #9333ea 100%)',
  borderRadius: '12px',
  color: '#ffffff',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: '18px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '18px 36px',
  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
  transition: 'all 0.3s ease',
}

const alternativeText = {
  color: '#6b7280',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 8px',
}

const linkText = {
  color: '#1e40af',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
  margin: '0 0 32px',
}

const warningSection = {
  margin: '32px 0',
}

const warningText = {
  color: '#dc2626',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '0',
  padding: '16px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  margin: '0 0 16px',
}

const footerBrand = {
  color: '#6b7280',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0',
}

const footerLink = {
  color: '#1e40af',
  textDecoration: 'none',
  fontWeight: '500',
}