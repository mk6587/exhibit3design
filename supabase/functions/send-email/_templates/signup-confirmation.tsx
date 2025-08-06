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

  return (
    <Html>
      <Head />
      <Preview>Welcome to Exhibit3Design - Confirm your account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Exhibit3Design!</Heading>
          
          <Text style={text}>
            Thank you for signing up! Please confirm your email address by clicking the button below:
          </Text>
          
          <Link
            href={confirmationUrl}
            target="_blank"
            style={button}
          >
            Confirm Your Email
          </Link>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={codeStyle}>
            {confirmationUrl}
          </Text>
          
          <Text style={footer}>
            If you didn't create an account with us, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            <strong>Exhibit3Design</strong><br />
            Premium exhibition stand design files for professionals
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