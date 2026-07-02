import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Trichomes Terms of Service — the terms and conditions governing your use of our website and services.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "13 May 2025";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-trichomes-forest mb-2 font-heading">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-10 font-body">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-sm max-w-none text-gray-700 font-body space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you
              and Trichomes Cosmeceuticals and Skincare ("Trichomes," "we," "us," or "our")
              governing your access to and use of our website <strong>trichomesshop.com</strong> and
              any related services.
            </p>
            <p className="mt-2">
              By accessing our website, creating an account, or making a purchase, you agree to be
              bound by these Terms. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years old to use our services.</li>
              <li>
                By using our website, you represent that you have the legal capacity to enter into
                a binding agreement.
              </li>
              <li>
                Our services are primarily intended for customers in Nigeria, though we may serve
                international customers at our discretion.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Products and Descriptions</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                We strive to display product images, descriptions, and pricing as accurately as
                possible. However, we do not guarantee that product descriptions are error-free.
              </li>
              <li>
                Product colours may vary slightly depending on your display settings.
              </li>
              <li>
                We reserve the right to modify, suspend, or discontinue any product at any time
                without notice.
              </li>
              <li>
                All prices are listed in Nigerian Naira (NGN) unless otherwise stated.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Orders and Payment</h2>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">a) Order Placement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                An order is not confirmed until you receive an order confirmation email from us.
              </li>
              <li>
                We reserve the right to refuse or cancel any order, including if we suspect
                fraudulent activity or if items are out of stock after your order is placed.
              </li>
              <li>
                If we cancel an order after payment, you will receive a full refund within 5–10
                business days.
              </li>
            </ul>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">b) Payment</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Payments are processed securely through Paystack. We accept cards, bank transfers,
                and USSD payments.
              </li>
              <li>
                By providing payment information, you represent that you are authorised to use the
                payment method.
              </li>
              <li>
                Prices are subject to change without notice. The price at the time of order
                confirmation is the binding price.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Shipping and Delivery</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Delivery timelines are estimates only and may be affected by factors outside our
                control (weather, courier delays, public holidays).
              </li>
              <li>
                Risk of loss and title for products pass to you upon delivery to the carrier.
              </li>
              <li>
                Please see our{" "}
                <Link href="/shipping" className="text-trichomes-forest underline">
                  Shipping Policy
                </Link>{" "}
                for full details on delivery timelines and fees.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Returns and Refunds</h2>
            <p>
              Our Return and Refund Policy, which is incorporated into these Terms by reference,
              sets out the conditions under which you may return products and receive refunds. Please
              review our{" "}
              <Link href="/returns" className="text-trichomes-forest underline">
                Return Policy
              </Link>{" "}
              before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account.
              </li>
              <li>
                You agree to notify us immediately of any unauthorised use of your account.
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that violate these Terms or
                engage in fraudulent activity.
              </li>
              <li>
                One person may not maintain multiple accounts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use our website for any unlawful purpose</li>
              <li>Attempt to hack, disrupt, or overload our website or servers</li>
              <li>Post false, misleading, or defamatory reviews or content</li>
              <li>Use automated tools (bots, scrapers) to access our website without permission</li>
              <li>Resell products purchased from us without prior written consent</li>
              <li>Infringe our intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Intellectual Property
            </h2>
            <p>
              All content on this website — including text, graphics, logos, images, and software —
              is the property of Trichomes Cosmeceuticals and Skincare or its content suppliers and
              is protected by Nigerian and international copyright laws. You may not reproduce,
              distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Disclaimer of Warranties
            </h2>
            <p>
              Our website and products are provided "as is" without any warranties, express or
              implied. We do not warrant that our website will be uninterrupted or error-free. To
              the extent permitted by Nigerian law, we disclaim all warranties including
              merchantability and fitness for a particular purpose.
            </p>
            <p className="mt-2">
              Skincare products should be tested on a small area of skin before full application.
              Individual results may vary. Our products are not intended to diagnose, treat, cure,
              or prevent any disease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Trichomes shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of our
              website or products. Our total liability to you for any claim arising from these Terms
              shall not exceed the amount you paid for the specific order giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal
              Republic of Nigeria. Any dispute arising from these Terms shall be subject to the
              exclusive jurisdiction of the courts of Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will take effect upon
              posting to our website. Your continued use of our services after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
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
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-body">
            <Link href="/privacy" className="hover:text-trichomes-forest underline">
              Privacy Policy
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
