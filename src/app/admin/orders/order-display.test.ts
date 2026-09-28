import {
  formatNaira,
  getOrderStatusVariant,
  getPaymentStatusVariant,
  isTerminalOrderStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./order-display";

describe("admin order display helpers", () => {
  it("keeps distinct fulfilment statuses visible", () => {
    expect(ORDER_STATUS_LABELS.CONFIRMED).toBe("Confirmed");
    expect(ORDER_STATUS_LABELS.READY_FOR_PICKUP).toBe("Ready for pickup");
    expect(ORDER_STATUS_LABELS.PICKED_UP).toBe("Picked up");
  });

  it("keeps distinct payment statuses visible", () => {
    expect(PAYMENT_STATUS_LABELS.PROCESSING).toBe("Processing");
    expect(PAYMENT_STATUS_LABELS.PARTIALLY_REFUNDED).toBe("Partially refunded");
  });

  it("maps statuses to consistent badge variants", () => {
    expect(getOrderStatusVariant("DELIVERED")).toBe("success");
    expect(getOrderStatusVariant("READY_FOR_PICKUP")).toBe("info");
    expect(getOrderStatusVariant("PROCESSING")).toBe("warning");
    expect(getOrderStatusVariant("CANCELLED")).toBe("danger");
    expect(getPaymentStatusVariant("COMPLETED")).toBe("success");
    expect(getPaymentStatusVariant("PARTIALLY_REFUNDED")).toBe("info");
  });

  it("identifies statuses that should not expose fulfilment changes", () => {
    expect(isTerminalOrderStatus("DELIVERED")).toBe(true);
    expect(isTerminalOrderStatus("REFUNDED")).toBe(true);
    expect(isTerminalOrderStatus("PROCESSING")).toBe(false);
  });

  it("formats Nigerian currency consistently", () => {
    expect(formatNaira(14716)).toBe("₦14,716");
  });
});
