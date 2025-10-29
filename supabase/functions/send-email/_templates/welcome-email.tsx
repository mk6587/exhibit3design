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

interface WelcomeEmailProps {
  user_email: string
  first_name?: string
  ai_studio_url: string
}

export const WelcomeEmail = ({
  user_email,
  first_name,
  ai_studio_url,
}: WelcomeEmailProps) => {
  const userName = first_name || user_email.split('@')[0]

  return (
    <Html>
      <Head />
      <Preview>Welcome to Exhibit3Design - Your FREE Starter Pack is Ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Welcome to Exhibit3Design, {userName}!</Heading>
          
          <Text style={text}>
            Thank you for joining us! We're thrilled to have you on board.
          </Text>

          <div style={highlightBox}>
            <Text style={highlightText}>
              <strong>🎁 Your FREE Starter Pack is Ready!</strong>
            </Text>
            <Text style={highlightSubtext}>
              1 AI Token + 1 Video Result to kickstart your exhibition design journey.
            </Text>
          </div>

          <div style={ctaSection}>
            <Heading style={h2}>Ready to Create Something Amazing?</Heading>
            <Text style={text}>
              Your free starter pack includes:
            </Text>
            <ul style={benefitsList}>
              <li style={benefitItem}>🎨 <strong>1 AI Token</strong> - Add visitors, magic edit designs, or create graphic banners</li>
              <li style={benefitItem}>🎬 <strong>1 Video Result</strong> - Generate stunning video presentations of your exhibition booth</li>
            </ul>
            
            <Link
              href={ai_studio_url}
              target="_blank"
              style={button}
            >
              Try AI Studio Now →
            </Link>
          </div>

          <div style={urgencyBox}>
            <Text style={urgencyText}>
              💡 <strong>Pro Tip:</strong> Start with the AI Studio to enhance your booth design, then use your video result to create a stunning presentation. 
              See how AI can transform your exhibition design workflow!
            </Text>
          </div>

          <div style={featuresSection}>
            <Heading style={h3}>What You Can Do:</Heading>
            <Text style={text}>
              • Browse our premium design library<br />
              • Request custom files from our team<br />
              • Use AI to generate unique exhibition concepts<br />
              • Access professional 3D design files
            </Text>
          </div>
          
          <Text style={footer}>
            <strong>Exhibit3Design</strong><br />
            Premium exhibition stand design files for professionals<br />
            Need help? Just reply to this email!
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
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '20px 0 15px 0',
  padding: '0',
}

const h3 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '14px',
  margin: '12px 0',
  lineHeight: '1.6',
}

const button = {
  backgroundColor: '#48bb78',
  borderRadius: '8px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  margin: '20px 0',
  width: '100%',
  boxSizing: 'border-box' as const,
}

const highlightBox = {
  backgroundColor: '#f0f4ff',
  border: '3px solid #667eea',
  borderRadius: '12px',
  padding: '25px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const highlightText = {
  color: '#667eea',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const highlightSubtext = {
  color: '#555',
  fontSize: '14px',
  margin: '0',
}

const ctaSection = {
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  padding: '25px',
  margin: '30px 0',
  border: '1px solid #e9ecef',
}

const benefitsList = {
  margin: '15px 0',
  paddingLeft: '20px',
  listStyleType: 'none' as const,
}

const benefitItem = {
  color: '#333',
  fontSize: '15px',
  margin: '12px 0',
  lineHeight: '1.6',
  paddingLeft: '0',
}

const urgencyBox = {
  backgroundColor: '#fff9e6',
  border: '2px solid #ffd700',
  borderRadius: '8px',
  padding: '18px',
  margin: '25px 0',
}

const urgencyText = {
  color: '#856404',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.6',
}

const featuresSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '30px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e9ecef',
  paddingTop: '20px',
}
