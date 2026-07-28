export const CATALOG_URL = "https://wa.me/c/254742152233";
const PHONE = "254742152233";

export function whatsappProductLink(productName: string): string {
  const text = encodeURIComponent(
    `Hi! I'm interested in the *${productName}* kit. Can you help me place an order?`
  );
  return `https://wa.me/${PHONE}?text=${text}`;
}

export function whatsappSubscribeLink(name: string): string {
  const text = encodeURIComponent(
    `Hi! I'd like to stay updated on new kits and offers. My name is ${name}.`
  );
  return `https://wa.me/${PHONE}?text=${text}`;
}

// ─── Order hand-off ─────────────────────────────────────────────────────────
//
// The WhatsApp checkout option is not a separate order book: the order is
// created in WooCommerce first (so stock, the delivery fee and /admin/orders
// all see it) and this only drafts the chat message that follows it. The order
// number is what ties the two together, so it leads the message.

export interface WhatsAppOrderLine {
  name:     string;
  quantity: number;
  /** Line total, not unit price. */
  total:    number;
}

export interface WhatsAppOrder {
  orderId:       number;
  lines:         WhatsAppOrderLine[];
  itemsSubtotal: number;
  discount:      number;
  deliveryFee:   number;
  total:         number;
  customerName:  string;
  phone:         string;
  area:          string;
  address:       string;
}

// The draft rides in the URL, and WhatsApp quietly drops anything past roughly
// 4000 characters. A long cart is collapsed to a count rather than truncated,
// so the lines shown always still add up to the subtotal quoted underneath.
const MAX_LISTED_LINES = 15;

function money(value: number): string {
  return `KES ${Math.round(value).toLocaleString("en-KE")}`;
}

export function whatsappOrderMessage(order: WhatsAppOrder): string {
  const lines: string[] = [
    `Hello Createch Hobbies! I have just placed order *#${order.orderId}* on your website.`,
    "",
  ];

  if (order.lines.length > MAX_LISTED_LINES) {
    const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);
    lines.push(`${itemCount} items across ${order.lines.length} products.`);
  } else {
    for (const l of order.lines) {
      lines.push(`• ${l.quantity} x ${l.name} — ${money(l.total)}`);
    }
  }

  lines.push("", `Subtotal: ${money(order.itemsSubtotal)}`);
  if (order.discount > 0) lines.push(`Discount: -${money(order.discount)}`);
  lines.push(
    `Delivery${order.area ? ` (${order.area})` : ""}: ${money(order.deliveryFee)}`,
    `*Total: ${money(order.total)}*`,
    "",
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`
  );
  if (order.address) lines.push(`Address: ${order.address}`);
  lines.push("", "Please confirm my order and let me know how to pay.");

  return lines.join("\n");
}

export function whatsappOrderLink(order: WhatsAppOrder): string {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(whatsappOrderMessage(order))}`;
}

export function whatsappGeneralLink(): string {
  return CATALOG_URL;
}
