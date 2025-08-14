import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface OrderConfirmationEmailProps {
  order: any
  orderNumber: string
  customerName: string
  orderToken?: string
}

export const OrderConfirmationEmail = ({
  order,
  orderNumber,
  customerName,
  orderToken,
}: OrderConfirmationEmailProps) => {
  const isGuestOrder = !order.user_id && orderToken;
  const orderLookupUrl = orderToken ? 
    `${typeof window !== 'undefined' ? window.location.origin : 'https://exhibit3design.lovable.app'}/order-lookup` : 
    null;

  return (
    <Html>
      <Head />
      <Preview>Payment Successful - Your Design Files Are Being Prepared</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Successful! 🎉</Heading>
          
          <Text style={text}>
            Dear {customerName},
          </Text>
          
          <Text style={text}>
            Thank you for your purchase! Your payment has been successfully processed and your design files are being prepared.
          </Text>
          
          <Section style={orderSection}>
            <Heading style={h2}>Order Details</Heading>
            <Text style={orderDetail}>
              <strong>Order Number:</strong> {orderNumber}
            </Text>
            <Text style={orderDetail}>
              <strong>Amount:</strong> ${order.amount}
            </Text>
            <Text style={orderDetail}>
              <strong>Payment Method:</strong> {order.payment_method || 'YekPay'}
            </Text>
            <Text style={orderDetail}>
              <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
            </Text>
          </Section>

          {isGuestOrder && orderToken && (
            <>
              <Hr style={hr} />
              <Section style={tokenSection}>
                <Heading style={h2}>🔐 Order Access Token</Heading>
                <Text style={text}>
                  Since you placed this order as a guest, here's your secure order token to track your order:
                </Text>
                <Text style={tokenStyle}>
                  {orderToken}
                </Text>
                <Text style={warningText}>
                  <strong>Important:</strong> Save this token safely! You'll need it to track your order status and access your files.
                </Text>
                {orderLookupUrl && (
                  <Link
                    href={orderLookupUrl}
                    target="_blank"
                    style={button}
                  >
                    Track Your Order
                  </Link>
                )}
              </Section>
            </>
          )}

          <Hr style={hr} />
          
          <Section style={nextStepsSection}>
            <Heading style={h2}>What's Next?</Heading>
            <Text style={text}>
              • We're preparing your premium design files
            </Text>
            <Text style={text}>
              • You'll receive download links within 24 hours
            </Text>
            <Text style={text}>
              • All files include CAD drawings, 3D renders, and specifications
            </Text>
            {isGuestOrder && (
              <Text style={text}>
                • Use your order token above to check status anytime
              </Text>
            )}
          </Section>
          
          <Hr style={hr} />
          
          <Text style={text}>
            Questions? Contact our support team at info@exhibit3design.com
          </Text>
          
          <Text style={footer}>
            <strong>Exhibit3Design</strong><br />
            Premium exhibition stand design files for professionals<br />
            Making your next exhibition a success
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
  margin: '40px 0 20px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
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
  lineHeight: '1.4',
}

const orderSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
}

const orderDetail = {
  color: '#333',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '1.4',
}

const tokenSection = {
  backgroundColor: '#fff3cd',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  border: '1px solid #ffeaa7',
}

const tokenStyle = {
  backgroundColor: '#f4f4f4',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  color: '#333',
  fontSize: '14px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
  margin: '10px 0',
}

const warningText = {
  color: '#856404',
  fontSize: '13px',
  margin: '10px 0',
  lineHeight: '1.4',
}

const nextStepsSection = {
  margin: '20px 0',
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
  margin: '15px 0',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}