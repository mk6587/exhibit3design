import { supabase } from '@/integrations/supabase/client';

export interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  bcc?: string | string[];
  cc?: string | string[];
  template?: {
    name: string;
    props: any;
  };
}

/**
 * General email service that uses the centralized send-email edge function
 */
export class EmailService {
  /**
   * Send an email using the general SMTP service
   */
  static async sendEmail(emailRequest: EmailRequest): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Sending email via EmailService:', emailRequest.to, emailRequest.subject);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailRequest
      });

      if (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Unexpected email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send contact form notification email
   */
  static async sendContactNotification(contactData: { name: string; email: string; message: string }): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to: 'info@exhibit3design.com',
      subject: `New Contact Form Submission from ${contactData.name}`,
      template: {
        name: 'contact-notification',
        props: contactData
      }
    });
  }

  /**
   * Send custom HTML email
   */
  static async sendCustomEmail(
    to: string | string[], 
    subject: string, 
    html: string, 
    options?: { bcc?: string | string[]; cc?: string | string[] }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to,
      subject,
      html,
      ...options
    });
  }

  /**
   * Send plain text email
   */
  static async sendTextEmail(
    to: string | string[], 
    subject: string, 
    text: string, 
    options?: { bcc?: string | string[]; cc?: string | string[] }
  ): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      to,
      subject,
      text,
      ...options
    });
  }
}

export default EmailService;