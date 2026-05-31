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

export function whatsappCartLink(
  _items?: { name: string; qty: number; price: number }[]
): string {
  return CATALOG_URL;
}

export function whatsappGeneralLink(): string {
  return CATALOG_URL;
}
