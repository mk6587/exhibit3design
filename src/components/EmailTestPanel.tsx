import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import EmailService from '@/services/emailService';

export const EmailTestPanel: React.FC = () => {
  const [emailType, setEmailType] = useState<'custom' | 'order-confirmation' | 'contact-notification'>('custom');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendTestEmail = async () => {
    if (!recipient) {
      toast.error('Please enter a recipient email');
      return;
    }

    setLoading(true);
    try {
      let result;

      switch (emailType) {
        case 'custom':
          if (!subject || !message) {
            toast.error('Please fill in subject and message');
            return;
          }
          result = await EmailService.sendCustomEmail(recipient, subject, message);
          break;

        case 'order-confirmation':
          const mockOrder = {
            amount: '99.99',
            created_at: new Date().toISOString(),
            customer_first_name: 'Test',
            customer_last_name: 'Customer',
            customer_email: recipient
          };
          result = await EmailService.sendOrderConfirmation(mockOrder, 'TEST-' + Date.now());
          break;

        case 'contact-notification':
          result = await EmailService.sendContactNotification({
            name: 'Test User',
            email: recipient,
            message: 'This is a test contact form submission.'
          });
          break;

        default:
          toast.error('Invalid email type');
          return;
      }

      if (result.success) {
        toast.success('Test email sent successfully!');
        setRecipient('');
        setSubject('');
        setMessage('');
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast.error(`Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Email Service Test Panel</CardTitle>
        <CardDescription>Test the email service functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-type">Email Type</Label>
          <Select value={emailType} onValueChange={(value: any) => setEmailType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Email</SelectItem>
              <SelectItem value="order-confirmation">Order Confirmation</SelectItem>
              <SelectItem value="contact-notification">Contact Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Email</Label>
          <Input
            id="recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="test@example.com"
          />
        </div>

        {emailType === 'custom' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Email message"
                rows={4}
              />
            </div>
          </>
        )}

        <Button 
          onClick={handleSendTestEmail} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </Button>
      </CardContent>
    </Card>
  );
};