import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "Trichomes Return and Refund Policy — how to return products and get your money back.",
  alternates: {
    canonical: `${SITE_URL}/returns`,
  },
};

export default function ReturnsPage() {
  const lastUpdated = "13 May 2025";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-trichomes-forest mb-2 font-heading">
          Return & Refund Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10 font-body">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-sm max-w-none text-gray-700 font-body space-y-8">
          <section>
            <p className="text-base">
              At Trichomes, we want you to be completely satisfied with your purchase. If for any
              reason you are not happy with your order, please review our return and refund policy
              below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Return Eligibility</h2>
            <p>We accept returns under the following conditions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                The return request is made within <strong>7 days</strong> of the delivery date.
              </li>
              <li>The item is unused, unopened, and in its original packaging.</li>
              <li>The item is not a sale/clearance item (final sale items are non-returnable).</li>
              <li>
                The item was not damaged due to misuse, negligence, or improper storage on your part.
              </li>
            </ul>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              Items That Cannot Be Returned
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Opened skincare or cosmetic products (for hygiene reasons)</li>
              <li>Items purchased on clearance or marked as final sale</li>
              <li>Gift cards or promotional credits</li>
              <li>Items returned after the 7-day window</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Damaged or Wrong Items</h2>
            <p>
              If you received a damaged, defective, or incorrect item, we sincerely apologise. In
              this case:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Contact us within <strong>48 hours</strong> of delivery at{" "}
                <a
                  href="mailto:support@trichomesshop.com"
                  className="text-trichomes-forest underline"
                >
                  support@trichomesshop.com
                </a>{" "}
                or via WhatsApp.
              </li>
              <li>
                Provide your order number and clear photos of the damage or incorrect item.
              </li>
              <li>
                We will arrange a replacement or full refund at no extra cost to you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Email us at{" "}
                <a
                  href="mailto:support@trichomesshop.com"
                  className="text-trichomes-forest underline"
                >
                  support@trichomesshop.com
                </a>{" "}
                or message us on WhatsApp at{" "}
                <a
                  href="https://wa.me/2348087098720"
                  className="text-trichomes-forest underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +234 808 709 8720
                </a>{" "}
                with your order number and reason for return.
              </li>
              <li>
                Our team will review your request and respond within 2 business days.
              </li>
              <li>
                If approved, we will provide return instructions including the return address.
              </li>
              <li>
                Ship the item back using a trackable courier service. The cost of return shipping
                is your responsibility unless the return is due to our error.
              </li>
              <li>
                Once we receive and inspect the returned item, we will process your refund or
                exchange.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Refunds</h2>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">Processing Time</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Approved refunds are processed within <strong>5–10 business days</strong> of receiving the returned item.</li>
              <li>
                Refunds are issued to your original payment method via Paystack.
              </li>
              <li>
                Bank processing times may vary — please allow up to 5 additional business days for
                the refund to appear in your account.
              </li>
            </ul>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">Partial Refunds</h3>
            <p>
              Partial refunds may be granted for items returned in a condition that does not fully
              meet our return requirements (e.g., minor damage to outer packaging, provided the
              product itself is sealed and unused).
            </p>
            <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">
              Non-Refundable Items
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Shipping and handling fees (unless the return is due to our error)</li>
              <li>Items returned outside the 7-day window</li>
              <li>Opened or used products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Exchanges</h2>
            <p>
              We currently offer exchanges for items that are defective, damaged, or incorrect. If
              you would like a different product, we recommend returning the original item for a
              refund and placing a new order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Order Cancellations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You may cancel an order within <strong>2 hours</strong> of placing it, provided it
                has not yet been processed for shipping.
              </li>
              <li>
                To cancel, contact us immediately at{" "}
                <a
                  href="mailto:support@trichomesshop.com"
                  className="text-trichomes-forest underline"
                >
                  support@trichomesshop.com
                </a>{" "}
                or via WhatsApp.
              </li>
              <li>
                If the order has already been dispatched, it cannot be cancelled — you will need to
                follow the return process once it arrives.
              </li>
              <li>
                Cancellation refunds are processed within 5 business days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p>
              For any return or refund queries, please reach out to us:
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
                <strong>Response time:</strong> within 2 business days
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-body">
            <Link href="/privacy" className="hover:text-trichomes-forest underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-trichomes-forest underline">
              Terms of Service
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
