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
        <Heading style={h1}>Welcome to Exhibit3Design!</Heading>
        <Text style={text}>
          Thank you for registering with Exhibit3Design! We're excited to help you access affordable exhibition stand design files that save you time and money.
        </Text>
        
        <Text style={text}>
          Please confirm your email address by clicking the button below:
        </Text>
        
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={button}
        >
          Confirm Your Email
        </Link>
        
        <Text style={text}>
          Or copy and paste this link in your browser:
        </Text>
        <Text style={link}>
          {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
        </Text>
        
        <Text style={{ ...text, marginTop: '32px' }}>
          <strong>About Exhibit3Design:</strong><br />
          We provide professional exhibition stand design files at affordable prices, helping businesses create stunning displays without breaking the budget.
        </Text>
        
        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '14px',
            marginBottom: '16px',
          }}
        >
          If you didn't create an account with us, you can safely ignore this email.
        </Text>
        
        <Text style={footer}>
          <Link
            href="https://exhibit3design.com"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            Exhibit3Design
          </Link>
          <br />
          Professional Exhibition Stand Design Files
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupConfirmationEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
}

const text = {
  color: '#333',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '6px',
  color: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
}

const link = {
  color: '#007bff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#898989',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '12px',
  lineHeight: '18px',
  marginTop: '32px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}