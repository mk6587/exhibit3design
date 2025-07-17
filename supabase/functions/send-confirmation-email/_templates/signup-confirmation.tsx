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
        <Section style={header}>
          <Img
            src="https://exhibit3design.com/logo.png"
            width="200"
            height="60"
            alt="Exhibit3Design"
            style={logo}
          />
        </Section>
        
        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Welcome to Exhibit3Design!</Heading>
          
          <Text style={subtitle}>
            Professional Exhibition Stand Design Files at Affordable Prices
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
              style={button}
            >
              Confirm Your Email Address
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
  backgroundColor: '#f8fafc',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '20px 0',
}

const container = {
  backgroundColor: '#ffffff',
  paddingLeft: '20px',
  paddingRight: '20px',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const header = {
  backgroundColor: '#1e40af',
  padding: '30px 20px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '40px 30px',
}

const h1 = {
  color: '#1f2937',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
  lineHeight: '1.3',
}

const subtitle = {
  color: '#6b7280',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  fontWeight: '500',
  textAlign: 'center' as const,
  margin: '0 0 32px',
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

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  boxShadow: '0 2px 4px rgba(30, 64, 175, 0.3)',
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
  backgroundColor: '#f3f4f6',
  padding: '24px',
  borderRadius: '6px',
  margin: '20px 0',
}

const valueTitle = {
  color: '#1f2937',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const valueText = {
  color: '#374151',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
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