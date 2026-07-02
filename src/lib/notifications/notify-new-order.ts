import { prisma } from "@/lib/prisma";

interface NotifyNewOrderParams {
  orderId: string;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  orderUrl?: string;
}

/**
 * Creates the in-app admin notification and emails staff/admin about a new order.
 * Fire-and-forget: callers should wrap this in a try/catch so a notification
 * failure never blocks order creation.
 */
export async function notifyNewOrder(
  params: NotifyNewOrderParams,
): Promise<void> {
  const {
    orderId,
    orderNumber,
    orderDate,
    customerName,
    customerEmail,
    total,
    itemCount,
    orderUrl,
  } = params;

  await prisma.notification.create({
    data: {
      type: "NEW_ORDER",
      title: `New order #${orderNumber}`,
      message: `${customerName} placed an order for ₦${total.toLocaleString()}`,
      order_id: orderId,
    },
  });

  const staffUsers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: { email: true },
  });

  const recipients = Array.from(
    new Set([
      ...(process.env.ADMIN_NOTIFICATION_EMAIL?.split(",")
        .map((email) => email.trim())
        .filter(Boolean) ?? []),
      ...staffUsers.map((user) => user.email),
    ]),
  );

  if (recipients.length === 0) return;

  const { sendNewOrderNotificationEmail } = await import("@/lib/email");
  await sendNewOrderNotificationEmail(recipients, {
    orderNumber,
    orderDate,
    customerName,
    customerEmail,
    total,
    itemCount,
    orderUrl,
  });
}
