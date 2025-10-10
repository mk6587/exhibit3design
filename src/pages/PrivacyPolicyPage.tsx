import Layout from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <Separator className="mb-6" />

        <div className="prose prose-sm md:prose-base max-w-none">
          <p className="text-muted-foreground mb-4">Last Updated: October 11, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Exhibit3Design ("we," "our," or "us").
              We value your privacy and are committed to protecting your personal information.
              This Privacy Policy describes how we collect, use, and safeguard your data when you visit our website, create an account, subscribe to a plan, or make a payment using our secure checkout.
            </p>
            <p className="mt-3">
              By accessing or using our services, you agree to the terms of this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="mb-4">
              We only collect the data necessary to operate our website, manage subscriptions, and deliver AI-powered design services.
            </p>
            
            <h3 className="text-lg font-semibold mb-3">A. Information You Provide Directly</h3>
            <p className="mb-3">When you register, subscribe, or make a payment, you provide the following details:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Mobile number</li>
              <li>Billing address (street, city, postal code, country)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Account credentials (email and password)</li>
              <li>Subscription details and token usage information</li>
            </ul>
            <p className="mb-4">
              This information is collected for account creation, billing, customer support, and secure payment processing.
            </p>

            <h3 className="text-lg font-semibold mb-3">B. Information Collected Automatically</h3>
            <p className="mb-3">When you browse our website or use our AI tools, we collect limited technical data automatically, including:</p>
            <ul className="list-disc pl-6 mb-3">
              <li>IP address and approximate region</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and session duration</li>
              <li>Token usage metrics (number of AI image/video generations)</li>
            </ul>
            <p>
              This information is used to maintain website performance, prevent fraud, and improve user experience.
              We do not use advertising trackers, cookies for profiling, or sell behavioral data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use your personal data only for legitimate business purposes, including:</p>
            <ul className="list-disc pl-6">
              <li>Creating and managing your account</li>
              <li>Processing payments and subscription renewals</li>
              <li>Allocating and tracking AI tokens per your plan</li>
              <li>Providing access to AI tools and generated content</li>
              <li>Sending invoices, renewal reminders, and important updates</li>
              <li>Offering customer support and handling service requests</li>
              <li>Detecting and preventing unauthorized or fraudulent activity</li>
              <li>Fulfilling legal, financial, and tax obligations</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal data with advertisers or unrelated third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. How We Share Your Information</h2>
            <p className="mb-4">
              We only share necessary data with trusted service providers that help us operate securely and efficiently:
            </p>
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Category</th>
                    <th className="border border-border px-4 py-2 text-left">Purpose</th>
                    <th className="border border-border px-4 py-2 text-left">Provider Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">Payment Processing</td>
                    <td className="border border-border px-4 py-2">To process payments and manage subscriptions securely</td>
                    <td className="border border-border px-4 py-2">Stripe</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Hosting & Storage</td>
                    <td className="border border-border px-4 py-2">To host our website and store encrypted data</td>
                    <td className="border border-border px-4 py-2">AWS / Vercel</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">AI Tools</td>
                    <td className="border border-border px-4 py-2">To process image and video generation requests</td>
                    <td className="border border-border px-4 py-2">Runware (Gemini Flash 2.5 & Kling 2.5 Turbo Pro)</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Email Delivery</td>
                    <td className="border border-border px-4 py-2">To send transactional or account-related emails</td>
                    <td className="border border-border px-4 py-2">SendGrid / Postmark</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              All service providers are contractually bound to follow strict confidentiality and data protection rules (e.g., GDPR compliance).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Payment Security</h2>
            <p>
              All payments are processed via Stripe, which uses advanced encryption and PCI DSS–compliant technology.
              We do not store or have access to your full credit card or payment information.
              We only retain payment references, such as invoice ID, plan type, and payment status, for record-keeping and tax purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Cookies and Local Storage</h2>
            <p className="mb-3">We use only essential cookies and local storage to:</p>
            <ul className="list-disc pl-6 mb-3">
              <li>Keep you securely logged in</li>
              <li>Remember your subscription plan and token balance</li>
              <li>Improve site speed and performance</li>
            </ul>
            <p>
              We do not use advertising or tracking cookies.
              You can disable cookies in your browser, but doing so may affect certain features (like staying logged in).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-6 mb-3">
              <li>Account and billing data are stored for as long as your account remains active.</li>
              <li>Transaction and invoice records are kept for as long as required by law (typically 5–7 years).</li>
              <li>If you close your account, we will delete or anonymize your data unless retention is legally required.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Security</h2>
            <p className="mb-3">We take data protection seriously and apply multiple security measures, including:</p>
            <ul className="list-disc pl-6 mb-3">
              <li>HTTPS (SSL/TLS) encryption for all web traffic</li>
              <li>Secure password hashing and encryption for stored data</li>
              <li>Restricted access controls for databases and admin systems</li>
              <li>Secure transmission of all payments through Stripe and AI requests through Runware APIs</li>
            </ul>
            <p>
              While we strive for the highest standards, no system is 100% secure.
              We recommend using a strong password and keeping your credentials private.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 mb-3">
              <li>Access and review the data we hold about you</li>
              <li>Request corrections or updates to your personal information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request a copy of your data (data portability)</li>
            </ul>
            <p>
              To exercise any of these rights, please email us at privacy@exhibit3design.com.
              We will respond within 30 days as required by applicable data protection laws (e.g., GDPR).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>
              Exhibit3Design is intended for professional and business use.
              We do not knowingly collect or process information from anyone under the age of 16.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect service changes, legal updates, or new technologies.
              Any updates will be posted on this page, and the "Last Updated" date will be revised accordingly.
              We encourage you to review this page periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-3">
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, you can contact us at:
            </p>
            <p>
              <strong>Email:</strong> info@exhibit3design.com<br />
              <strong>Website:</strong> www.exhibit3design.com | ai.exhibit3design.com
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;