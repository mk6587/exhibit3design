
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
    question: "What file formats do you provide?",
    answer: "We provide our exhibition stand designs in multiple formats including SketchUp (.skp), 3D Studio Max (.max), 3D Studio (.3ds), and PDF for technical drawings. This ensures compatibility with most 3D modeling and design software."
  },
  {
    question: "Can I modify the designs after purchase?",
    answer: "Yes, all our design files are fully editable. You can customize colors, materials, dimensions, and other elements to suit your specific needs. The files are structured with organized layers and components to make customization straightforward."
  },
  {
    question: "What's included in the purchase?",
    answer: "Each purchase includes all the advertised file formats, complete with materials, textures, and lighting setups (where applicable). You'll also receive a PDF with technical specifications and assembly guidelines."
  },
  {
    question: "How do I download my purchases?",
    answer: "After completing your purchase, you'll receive an email with download instructions. You can also access your downloads from your account dashboard. The download links are secure and will expire after a certain period for security reasons."
  },
  {
    question: "What is your refund policy?",
    answer: "Due to the digital nature of our products, we generally do not offer refunds once the files have been downloaded. However, if you experience technical issues with the files, please contact our support team, and we'll assist you in resolving the issue."
  },
  {
    question: "Can I use these designs for commercial projects?",
    answer: "Yes, our standard license allows you to use the designs for commercial exhibition projects. You can modify them and use them for client work. However, you may not resell or redistribute the original design files."
  },
  {
    question: "Do you offer custom design services?",
    answer: "Yes, we offer custom exhibition stand design services tailored to your specific requirements. Please contact us through our contact page with your project details for a custom quote."
  },
  {
    question: "How often do you add new designs?",
    answer: "We add new designs to our collection regularly, typically 5-10 new designs each month. Sign up for our newsletter to be notified when new designs are available."
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes, we offer discounts for bulk purchases. If you're interested in purchasing multiple designs, please contact us for a custom quote."
  },
  {
    question: "What software do I need to open the files?",
    answer: "To open .skp files, you'll need SketchUp. For .max files, you'll need 3D Studio Max. For .3ds files, you can use various 3D modeling software like Blender, Maya, or 3D Studio Max. PDF files can be opened with any PDF reader."
  }
];

const FaqPage = () => {
  return (
    <Layout>
      <div className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">
            Find answers to the most common questions about our exhibition stand designs and services.
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
      </div>
    </Layout>
  );
};

export default FaqPage;
