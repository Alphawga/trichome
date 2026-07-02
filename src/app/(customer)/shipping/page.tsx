import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Trichomes Shipping Policy — delivery timelines, fees, and how we get your order to you.",
  alternates: {
    canonical: `${SITE_URL}/shipping`,
  },
};

export default function ShippingPolicyPage() {
  const lastUpdated = "13 May 2025";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-trichomes-forest mb-2 font-heading">
          Shipping Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10 font-body">
          Last updated: {lastUpdated}
        </p>

        <div className="prose prose-sm max-w-none text-gray-700 font-body space-y-8">
          <section>
            <p className="text-base">
              At Trichomes, we work hard to get your skincare essentials to you as quickly and safely
              as possible. Please review our shipping policy below for details on delivery timelines,
              fees, and what to expect after you place your order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Order Processing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Orders are processed within <strong>1–2 business days</strong> after payment is
                confirmed. Business days are Monday to Friday, excluding Nigerian public holidays.
              </li>
              <li>
                You will receive an order confirmation email and a shipping notification email with
                tracking information once your order has been dispatched.
              </li>
              <li>
                Orders placed on weekends or public holidays will be processed on the next business
                day.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Delivery Timelines</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                      Estimated Delivery
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">
                      Shipping Fee
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3">Lagos (Mainland & Island)</td>
                    <td className="px-4 py-3">1–3 business days</td>
                    <td className="px-4 py-3">Calculated at checkout</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Other South-West States</td>
                    <td className="px-4 py-3">2–4 business days</td>
                    <td className="px-4 py-3">Calculated at checkout</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Other Nigerian States</td>
                    <td className="px-4 py-3">3–7 business days</td>
                    <td className="px-4 py-3">Calculated at checkout</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Remote Areas</td>
                    <td className="px-4 py-3">5–10 business days</td>
                    <td className="px-4 py-3">Calculated at checkout</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              * Delivery timelines are estimates and may be affected by courier delays, weather
              conditions, or peak periods (e.g., festive seasons).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Shipping Fees</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Shipping fees are calculated at checkout based on your delivery address and order
                weight.
              </li>
              <li>
                Free shipping may be available for orders above a certain threshold — check our
                website for current promotions.
              </li>
              <li>
                Shipping fees are non-refundable unless the return is due to our error (e.g., wrong
                or damaged item sent).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Order Tracking</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Once your order is dispatched, you will receive a tracking number via email or SMS.
              </li>
              <li>
                You can also track your order on our website at{" "}
                <Link href="/track-order" className="text-trichomes-forest underline">
                  trichomesshop.com/track-order
                </Link>
                .
              </li>
              <li>
                If you have not received tracking information within 3 business days of placing
                your order, please contact us.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Delivery Attempts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Our delivery partners will attempt delivery up to 2 times. After a failed delivery,
                your parcel may be held at a collection point for up to 5 days.
              </li>
              <li>
                Please ensure your delivery address and phone number are correct at checkout.
              </li>
              <li>
                Trichomes is not liable for failed deliveries due to incorrect address information
                provided by the customer.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Lost or Delayed Packages</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                If your order has not arrived within the estimated delivery window, please contact
                us at{" "}
                <a
                  href="mailto:support@trichomesshop.com"
                  className="text-trichomes-forest underline"
                >
                  support@trichomesshop.com
                </a>
                .
              </li>
              <li>
                We will investigate with the courier and update you within 3 business days.
              </li>
              <li>
                If a package is confirmed lost, we will either resend your order or provide a full
                refund.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Packaging</h2>
            <p>
              We take care to pack all orders securely to prevent damage in transit. Our packaging
              is designed to protect your products and minimise environmental impact. If your order
              arrives with damaged packaging that has affected the products, please contact us
              within 48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact Us</h2>
            <p>For shipping inquiries, please contact us:</p>
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
            <Link href="/returns" className="hover:text-trichomes-forest underline">
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
