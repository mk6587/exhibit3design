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

interface PasswordResetEmailProps {
  supabase_url: string
  token_hash: string
  email_action_type: string
  redirect_to?: string
  user_email: string
}

export const PasswordResetEmail = ({
  supabase_url,
  token_hash,
  email_action_type,
  redirect_to,
  user_email,
}: PasswordResetEmailProps) => {
  const exhibitUrl = 'https://www.exhibit3design.com/reset-password'
  const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || exhibitUrl}`

  return (
    <Html>
      <Head />
      <Preview>Reset your Exhibit3Design password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          
          <Text style={text}>
            We received a request to reset your password for your Exhibit3Design account ({user_email}).
          </Text>
          
          <Text style={text}>
            Click the button below to reset your password:
          </Text>
          
          <Link
            href={resetUrl}
            target="_blank"
            style={button}
          >
            Reset Password
          </Link>
          
          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={codeStyle}>
            {resetUrl}
          </Text>
          
          <Text style={footer}>
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </Text>
          
          <Text style={footer}>
            This link will expire in 24 hours for security reasons.
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
  backgroundColor: '#dc3545',
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