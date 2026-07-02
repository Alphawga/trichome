import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Trichomes Privacy Policy — how we collect, use, and protect your personal data.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "13 May 2025";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-trichomes-forest mb-2 font-heading">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10 font-body">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-sm max-w-none text-gray-700 font-body space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Trichomes Cosmeceuticals and Skincare ("Trichomes," "we," "us," or "our") is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website{" "}
              <strong>trichomesshop.com</strong> and make purchases from us. By using our website, you
              agree to the collection and use of information in accordance with this policy.
            </p>
            <p>
              This policy is designed to comply with the Nigeria Data Protection Act (NDPA) 2023,
              enforced by the Nigeria Data Protection Commission (NDPC), and other applicable
              Nigerian data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>We collect the following categories of personal information:</p>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              a) Information You Provide Directly
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name, email address, phone number, and delivery address</li>
              <li>Account login credentials (email and password)</li>
              <li>Payment information (processed securely via Paystack; we do not store card details)</li>
              <li>Order details, product reviews, and consultation requests</li>
              <li>Communications you send us via email, WhatsApp, or our contact form</li>
            </ul>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              b) Information Collected Automatically
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type, IP address, device information, and operating system</li>
              <li>Pages visited, time spent on pages, and referring URLs</li>
              <li>Shopping cart contents and purchase history</li>
              <li>Cookie data (see Section 8)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfill your orders, and send order confirmations and shipping updates</li>
              <li>Create and manage your customer account</li>
              <li>Process payments securely through Paystack</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send transactional emails (order updates, password resets)</li>
              <li>
                Send promotional communications if you have opted in (you may unsubscribe at any time)
              </li>
              <li>Improve our website, products, and services</li>
              <li>Prevent fraud and ensure the security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following grounds:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Contract performance:</strong> to process your orders and provide our services
              </li>
              <li>
                <strong>Legitimate interests:</strong> to improve our website and prevent fraud
              </li>
              <li>
                <strong>Consent:</strong> for marketing communications (which you may withdraw at any time)
              </li>
              <li>
                <strong>Legal obligation:</strong> where required by Nigerian law
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sharing Your Information</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Paystack:</strong> our payment processor, to complete transactions securely
              </li>
              <li>
                <strong>Delivery partners:</strong> to fulfill and deliver your orders
              </li>
              <li>
                <strong>Email service provider (Brevo):</strong> to send order and account emails
              </li>
              <li>
                <strong>Cloudinary:</strong> for secure image storage
              </li>
              <li>
                <strong>Analytics providers:</strong> to understand website usage (anonymised data)
              </li>
              <li>
                <strong>Law enforcement or regulators:</strong> where required by law or court order
              </li>
            </ul>
            <p className="mt-2">
              All third-party service providers are required to handle your data securely and in
              accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide our services and
              comply with legal obligations:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account data: retained while your account is active, then 2 years after closure</li>
              <li>Order records: 7 years for tax and accounting purposes</li>
              <li>Marketing consent records: until you withdraw consent</li>
              <li>Security logs: 12 months</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p>Under the NDPA, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Access:</strong> request a copy of the personal data we hold about you
              </li>
              <li>
                <strong>Rectification:</strong> request correction of inaccurate data
              </li>
              <li>
                <strong>Erasure:</strong> request deletion of your data (subject to legal obligations)
              </li>
              <li>
                <strong>Restriction:</strong> request that we restrict processing of your data
              </li>
              <li>
                <strong>Portability:</strong> receive your data in a portable format
              </li>
              <li>
                <strong>Objection:</strong> object to processing based on legitimate interests
              </li>
              <li>
                <strong>Withdraw consent:</strong> for any consent-based processing
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please email us at{" "}
              <a
                href="mailto:support@trichomesshop.com"
                className="text-trichomes-forest underline"
              >
                support@trichomesshop.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience. Cookies are small text
              files stored on your device. We use:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Essential cookies:</strong> required for the website to function (e.g., session
                management, shopping cart)
              </li>
              <li>
                <strong>Analytics cookies:</strong> to understand how visitors use our website
                (anonymised)
              </li>
              <li>
                <strong>Preference cookies:</strong> to remember your settings
              </li>
            </ul>
            <p className="mt-2">
              You can control cookies through your browser settings. Disabling essential cookies may
              affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal
              data against unauthorised access, alteration, disclosure, or destruction. Payment
              transactions are processed via Paystack using industry-standard SSL encryption.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
            <p>
              Our services are not directed to children under the age of 13. We do not knowingly
              collect personal information from children. If you believe a child has provided us with
              personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make significant changes,
              we will notify you by email or by posting a prominent notice on our website. The "Last
              updated" date at the top of this page will always reflect the most recent version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your personal data,
              please contact us:
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@trichomesshop.com"
                  className="text-trichomes-forest underline"
                >
                  support@trichomesshop.com
                </a>
              </li>
              <li>
                <strong>WhatsApp:</strong>{" "}
                <a
                  href="https://wa.me/2348087098720"
                  className="text-trichomes-forest underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +234 808 709 8720
                </a>
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <Link href="/" className="text-trichomes-forest underline">
                  trichomesshop.com
                </Link>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-body">
            <Link href="/terms" className="hover:text-trichomes-forest underline">
              Terms of Service
            </Link>
            <Link href="/returns" className="hover:text-trichomes-forest underline">
              Return Policy
            </Link>
            <Link href="/shipping" className="hover:text-trichomes-forest underline">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
