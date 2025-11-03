
import Layout from "@/components/layout/Layout";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "What subscription plans do you offer?",
    answer: "We offer three one-time payment plans: Basic, Professional, and Enterprise. Each plan includes a one-time allocation of AI tokens for generating images and videos, plus access to our library of ready-made exhibition stand designs for the plan duration. Higher tiers provide more tokens and additional features. Visit our Pricing page to compare plans and find the right fit for your needs."
  },
  {
    question: "What are AI tokens and how do they work?",
    answer: "AI tokens are credits used to generate images and videos using our AI tools. Each generation consumes a certain number of tokens depending on the complexity and type of content. For example, image generation may use fewer tokens than video generation. You receive tokens once when you purchase a plan and can use them throughout the plan period."
  },
  {
    question: "What AI tools are included in my subscription?",
    answer: "Your subscription includes access to powerful AI generation tools for creating custom exhibition stand designs. You can generate high-quality images and videos based on text prompts, upload reference files, and customize outputs. All generations are powered by advanced AI models including Gemini Flash 2.5 and Kling 2.5 Turbo Pro."
  },
  {
    question: "What happens when I run out of tokens?",
    answer: "When you use all your tokens, you won't be able to generate new AI content until you purchase a new plan. You can upgrade to a higher-tier plan at any time to receive more tokens. You'll still have full access to any previously generated content and our library of ready-made designs during your plan period."
  },
  {
    question: "Can I download and modify the designs?",
    answer: "Yes! All ready-made designs in our library are available in multiple formats including SketchUp (.skp), 3D Studio Max (.max), 3D Studio (.3ds), and PDF. Files are fully editable, allowing you to customize colors, materials, dimensions, and other elements. AI-generated content can be downloaded in high-resolution formats for your projects."
  },
  {
    question: "Can I use these designs for commercial projects?",
    answer: "Absolutely. Your subscription license allows you to use both ready-made designs and AI-generated content for commercial exhibition projects and client work. You can modify and adapt them to your specific needs. However, you may not resell, redistribute, or share the original design files or your account access with others."
  },
  {
    question: "How does billing work?",
    answer: "All plans are one-time payments processed securely via payment gateway. You pay once and get access to your plan benefits for the specified period (monthly or annual based on the plan you choose). There are no automatic renewals or recurring charges. When your plan expires, you can choose to purchase a new plan to continue access. You can view your purchase history from your profile dashboard."
  },
  {
    question: "Can I cancel my plan anytime?",
    answer: "Since plans are one-time purchases rather than subscriptions, there's no recurring billing to cancel. You have access to your plan benefits for the full duration of your purchased period. After the period ends, you simply won't be charged again unless you choose to purchase a new plan. Any content you've already generated or downloaded remains yours permanently."
  },
  {
    question: "What file formats are provided for ready-made designs?",
    answer: "Our ready-made exhibition stand designs are provided in professional formats: SketchUp (.skp), 3D Studio Max (.max), 3D Studio (.3ds), and PDF for technical drawings. This ensures compatibility with most 3D modeling software. AI-generated images are provided in high-resolution PNG or JPG formats, and videos in MP4 format."
  },
  {
    question: "How often is new content added?",
    answer: "We regularly update our library with new ready-made designs and continuously improve our AI generation capabilities. New designs are typically added monthly. As a plan holder, you'll have immediate access to all new additions and AI model upgrades at no extra cost during your plan period."
  },
  {
    question: "What if I need help using the AI tools?",
    answer: "We provide comprehensive guides and sample prompts to help you get the best results from our AI tools. If you need additional assistance, our support team is available via the contact page. We're here to help you create stunning exhibition designs efficiently."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, all payments are processed through Stripe, an industry-leading payment processor with bank-level security. We never store your complete credit card information on our servers. Your payment data is encrypted and handled according to PCI DSS compliance standards."
  }
];

const FaqPage = () => {
  return (
    <Layout
      title="FAQ - Exhibition Stand Design Questions | AI Tools & 3D Downloads | Exhibit3Design"
      description="Common questions about AI-powered exhibition design tools, 3D booth file downloads, AI tokens, 360° video generation, photorealistic rendering, subscriptions, file formats (SKP, 3DS), and instant booth customization. Get answers about our AI exhibition design platform."
      keywords="exhibition design FAQ, AI exhibition questions, 3D booth download FAQ, exhibition AI tools help, booth design subscription FAQ, exhibition stand design questions, AI rendering FAQ, 360 video booth FAQ, sketch to render help, magic edit FAQ, exhibition file formats, booth design tokens, AI design subscription, exhibition design help, trade show booth FAQ, booth customization questions, AI booth tools FAQ, exhibition design pricing, 3D stand design FAQ, booth rendering questions, AI exhibition platform help"
      url="https://exhibit3design.com/faq"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">
            Find answers to the most common questions about our subscription plans, AI tools, and design services.
          </p>
          
          <Accordion type="single" collapsible className="mb-8">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="bg-secondary p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
            <p className="mb-4">
              We're here to help. Contact our support team for assistance.
            </p>
            <Button asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FaqPage;
