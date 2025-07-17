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

interface SignupConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const SignupConfirmationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: SignupConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Exhibit3Design - Confirm your account</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={headerGradient}>
          <Section style={header}>
            <Img
              src="https://fipebdkvzdrljwwxccrj.supabase.co/storage/v1/object/public/images/exhibit3design-logo.png"
              width="220"
              height="65"
              alt="Exhibit3Design"
              style={logo}
            />
          </Section>
        </Section>
        
        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>✨ Welcome to Exhibit3Design! ✨</Heading>
          
          <Text style={subtitle}>
            🏆 Professional Exhibition Stand Design Files at Affordable Prices
          </Text>
          
          <Text style={text}>
            Thank you for joining Exhibit3Design! We're excited to help you create stunning exhibition displays that save you time and money.
          </Text>
          
          <Text style={text}>
            Please confirm your email address to complete your registration:
          </Text>
          
          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              target="_blank"
              style={gradientButton}
            >
              🚀 Confirm Your Email & Get Started
            </Link>
          </Section>
          
          <Text style={alternativeText}>
            If the button doesn't work, copy and paste this link in your browser:
          </Text>
          <Text style={linkText}>
            {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          </Text>
        </Section>
        
        <Hr style={divider} />
        
        {/* Value Proposition */}
        <Section style={valueSection}>
          <Text style={valueTitle}>Why Choose Exhibit3Design?</Text>
          <Text style={valueText}>
            ✓ Professional quality designs from industry experts<br/>
            ✓ Affordable prices - up to 80% less than custom design<br/>
            ✓ Instant download after purchase<br/>
            ✓ Ready-to-use files for immediate implementation
          </Text>
        </Section>
        
        <Hr style={divider} />
        
        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            If you didn't create an account with us, you can safely ignore this email.
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

export default SignupConfirmationEmail

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

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const valueSection = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  padding: '32px',
  borderRadius: '12px',
  margin: '30px 0',
  border: '1px solid #e2e8f0',
}

const valueTitle = {
  color: '#1e293b',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const valueText = {
  color: '#475569',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '0',
  fontWeight: '500',
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