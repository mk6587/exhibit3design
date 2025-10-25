import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SignupConfirmationEmailProps {
  supabase_url: string
  token_hash: string
  email_action_type: string
  redirect_to?: string
  user_email: string
}

export const SignupConfirmationEmail = ({
  supabase_url,
  token_hash,
  email_action_type,
  redirect_to,
  user_email,
}: SignupConfirmationEmailProps) => {
  const confirmationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || `${supabase_url}/`}`
  const aiStudioUrl = `https://fipebdkvzdrljwwxccrj.supabase.co/`

  return (
    <Html>
      <Head />
      <Preview>Welcome to Exhibit3Design - You've Got 2 FREE AI Tokens!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Welcome to Exhibit3Design!</Heading>
          
          <Text style={text}>
            Thank you for joining us! We're excited to help you create amazing exhibition stand designs.
          </Text>

          <Text style={highlightBox}>
            <strong style={highlightText}>🎁 You've Got 2 FREE AI Tokens!</strong><br />
            Start creating stunning exhibition designs with our AI Studio right away.
          </Text>
          
          <Text style={text}>
            First, confirm your email to activate your account:
          </Text>
          
          <Link
            href={confirmationUrl}
            target="_blank"
            style={button}
          >
            Confirm Your Email & Get Started
          </Link>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={codeStyle}>
            {confirmationUrl}
          </Text>

          <div style={ctaSection}>
            <Heading style={h2}>Ready to Create Something Amazing?</Heading>
            <Text style={text}>
              Your 2 free AI tokens are waiting! Use them to:
            </Text>
            <ul style={benefitsList}>
              <li style={benefitItem}>✨ Generate custom exhibition stand designs</li>
              <li style={benefitItem}>🎨 Transform your ideas into professional 3D renders</li>
              <li style={benefitItem}>⚡ Get instant design variations and concepts</li>
            </ul>
            
            <Link
              href={aiStudioUrl}
              target="_blank"
              style={secondaryButton}
            >
              Try AI Studio Now →
            </Link>
          </div>

          <Text style={urgencyText}>
            💡 <strong>Pro Tip:</strong> Your free tokens are perfect for exploring what's possible. 
            Try them out and see how AI can transform your exhibition design workflow!
          </Text>
          
          <Text style={footer}>
            If you didn't create an account with us, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            <strong>Exhibit3Design</strong><br />
            Premium exhibition stand design files for professionals<br />
            Need help? Visit our website or reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '14px',
  margin: '24px 0',
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 20px',
  margin: '20px 0',
}

const codeStyle = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
}

const highlightBox = {
  backgroundColor: '#f0f4ff',
  border: '2px solid #667eea',
  borderRadius: '8px',
  padding: '20px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const highlightText = {
  color: '#667eea',
  fontSize: '18px',
}

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '30px 0 15px 0',
  padding: '0',
}

const ctaSection = {
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  padding: '25px',
  margin: '30px 0',
}

const benefitsList = {
  margin: '15px 0',
  paddingLeft: '20px',
}

const benefitItem = {
  color: '#333',
  fontSize: '14px',
  margin: '10px 0',
  lineHeight: '1.6',
}

const secondaryButton = {
  backgroundColor: '#48bb78',
  borderRadius: '8px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  margin: '20px 0',
}

const urgencyText = {
  backgroundColor: '#fff9e6',
  border: '1px solid #ffd700',
  borderRadius: '6px',
  padding: '15px',
  color: '#856404',
  fontSize: '14px',
  margin: '20px 0',
  lineHeight: '1.5',
}