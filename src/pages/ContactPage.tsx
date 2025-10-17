import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import EmailService from "@/services/emailService";
import { contactFormSchema, type ContactFormData } from "@/lib/validationSchemas";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = contactFormSchema.parse({
        name: formData.name,
        email: formData.email,
        message: `Subject: ${formData.subject}\n\n${formData.message}`
      });

      const { success, error } = await EmailService.sendContactNotification(validatedData);

      if (success) {
        toast.success("Message sent successfully", {
          description: "We'll get back to you as soon as possible."
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(error || "Failed to send message");
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // Handle Zod validation errors
        const validationErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            validationErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(validationErrors);
        toast.error("Validation error", {
          description: "Please check your input and try again."
        });
      } else {
        console.error("Error sending message:", error);
        toast.error("Failed to send message", {
          description: "Please try again or contact us directly."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Layout
      title="Contact AI Exhibition Design Experts | Exhibit3Design"
      description="Get help with AI-powered exhibition design tools, subscriptions, or custom projects. Contact our team for AI design support and consultation."
      keywords="exhibition design contact, AI design support, exhibition AI help, design consultation"
      url="https://exhibit3design.com/contact"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              <p className="mb-6 text-muted-foreground">
                Have questions about our products, licensing, or need custom design assistance?
                We're here to help.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">info@exhibit3design.com</p>
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-muted-foreground">+44 7508 879096</p>
                </div>
                <div>
                  
                  
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required />
                    {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                  </div>
                  
                  
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default ContactPage;