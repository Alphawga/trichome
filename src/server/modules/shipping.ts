import { z } from "zod";
import { getShippingRates } from "@/lib/shipping/get-shipping-rate";
import { shippingQuoteRateLimited } from "../trpc";

export const getShippingRate = shippingQuoteRateLimited
  .input(
    z.object({
      state: z.string().min(1),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().default("Nigeria"),
      addressLine: z.string().min(1, "Street address is required"),
      contactName: z.string().min(1, "Contact name is required"),
      contactEmail: z.string().email(),
      contactPhone: z.string().min(1, "Contact phone is required"),
      weightKg: z.number().min(0),
      subtotal: z.number().min(0),
      items: z.array(
        z.object({
          name: z.string(),
          unitWeightKg: z.number().min(0),
          unitAmount: z.number().min(0),
          quantity: z.number().int().min(1),
        }),
      ),
    }),
  )
  .query(async ({ input }) => {
    const rates = await getShippingRates({
      destination: {
        state: input.state,
        city: input.city,
        postalCode: input.postalCode,
        country: input.country,
        addressLine: input.addressLine,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      },
      weightKg: input.weightKg,
      subtotal: input.subtotal,
      items: input.items,
    });

    return { rates };
  });
