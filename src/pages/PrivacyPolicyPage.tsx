import Layout from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <Separator className="mb-6" />

        <div className="prose prose-sm md:prose-base max-w-none">
          <p className="text-muted-foreground mb-4">Last Updated: July 17, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Exhibit3Design. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              and use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 mb-3">
              <li>Register for an account</li>
              <li>Purchase products</li>
              <li>Sign up for our newsletter</li>
              <li>Contact us</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p>
              This information may include your name, email address, postal address, phone number, and payment information.
            </p>
            <p className="mt-3">
              We also automatically collect certain information when you visit our website, including:
            </p>
            <ul className="list-disc pl-6">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Pages visited</li>
              <li>Time spent on pages</li>
              <li>Referring website</li>
              <li>Other browsing information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6">
              <li>Provide, operate, and maintain our website and services</li>
              <li>Process and complete transactions</li>
              <li>Send you order confirmations and updates</li>
              <li>Provide customer support</li>
              <li>Send you technical notices and security alerts</li>
              <li>Respond to your comments and questions</li>
              <li>Improve our website and services</li>
              <li>Develop new products and services</li>
              <li>Prevent fraud and abuse</li>
              <li>Send you marketing communications (if you have opted in)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. How We Share Your Information</h2>
            <p className="mb-3">
              We may share your information with third parties in the following situations:
            </p>
            <ul className="list-disc pl-6">
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>To protect and defend our rights and property</li>
              <li>With your consent or at your direction</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6">
              <li>Right to access personal data we hold about you</li>
              <li>Right to request correction of your personal data</li>
              <li>Right to request deletion of your personal data</li>
              <li>Right to object to processing of your personal data</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. 
              However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%. 
              We are not responsible for the circumvention of any privacy settings or security measures on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy 
              periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-3">
              Email: info@exhibitdesigns.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;