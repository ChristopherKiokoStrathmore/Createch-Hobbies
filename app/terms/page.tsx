import Link from "next/link";

const sections = [
  {
    title: "1. Definitions",
    content: [
      '"Company" means Createch Hobbies, a business registered and operating under the laws of Kenya.',
      '"Customer / Buyer" means any individual or entity purchasing products or services from Createch Hobbies.',
      '"Products" means all hobby kits, creative materials, technology accessories, educational toys, craft supplies, remote-controlled devices, and related merchandise offered for sale by the Company.',
      '"Order" means a confirmed request by the Customer to purchase one or more Products.',
      '"Payment" means full settlement of the purchase price by any accepted payment method prior to processing of the Order.',
      '"Delivery" means physical transfer of the Product(s) to the Customer or an authorised representative.',
      '"Business Day" means any day that is not a Saturday, Sunday, or public holiday recognised in Kenya.',
    ],
  },
  {
    title: "2. General Terms",
    content: [
      "2.1 These Terms constitute the entire agreement between the Customer and Createch Hobbies with respect to any transaction and supersede all prior representations, discussions, or agreements.",
      "2.2 Createch Hobbies reserves the right to amend these Terms at any time. Updated Terms will be published on our website and/or displayed in-store and shall apply to all Orders placed after the date of publication.",
      "2.3 If any provision of these Terms is found to be unenforceable under applicable Kenyan law, the remaining provisions shall continue in full force and effect.",
      "2.4 These Terms shall be governed by and construed in accordance with the laws of Kenya, including but not limited to the Sale of Goods Act (Cap. 31), the Consumer Protection Act, 2012, and the Kenya Information and Communications Act.",
    ],
  },
  {
    title: "3. Products and Ordering",
    subsections: [
      {
        heading: "3.1 Product Descriptions",
        body: "We make every effort to accurately describe our Products, including our DIY Kits, Materials, Technology, remote-controlled vehicles, STEM kits, art supplies, and related merchandise. However, colours may vary slightly due to monitor display settings. Product images are for illustrative purposes only.",
      },
      {
        heading: "3.2 Stock Availability",
        body: "All Orders are subject to availability. In the event that a Product becomes unavailable after an Order is placed, we will notify you promptly and offer one of the following: a replacement Product of equivalent value upon mutual agreement, a store credit, or a full refund of any amount already paid.",
      },
      {
        heading: "3.3 Age and Safety Guidance",
        body: "Certain Products are designed for specific age groups. Customers are responsible for ensuring that Products purchased are appropriate for the intended user. Age guidance stated on packaging must be observed. Createch Hobbies shall not be liable for injury or damage arising from misuse or use by persons outside the recommended age range.",
      },
      {
        heading: "3.4 Order Confirmation",
        body: "An Order is only confirmed once full payment has been received and a confirmation message (SMS, email, or receipt) has been issued by the Company. The Company reserves the right to decline or cancel any Order at its discretion, with a full refund of any amount paid.",
      },
    ],
  },
  {
    title: "4. Pricing and Taxes",
    content: [
      "4.1 All prices are quoted in Kenya Shillings (KES) and are inclusive of applicable Taxes at the prevailing rate set by the Kenya Revenue Authority (KRA), unless otherwise stated and exclusive of delivery charges.",
      "4.2 Prices are subject to change without prior notice. The price applicable to your Order is the price confirmed at the time of Order placement.",
      "4.3 Delivery or courier charges, where applicable, will be added separately before Order confirmation.",
      "4.4 Promotional prices are valid only for the stated promotional period and cannot be applied retrospectively to completed Orders.",
    ],
  },
  {
    title: "5. Payment Terms",
    subsections: [
      {
        heading: "5.1 Payment Obligation",
        body: "Full payment of the total Order value must be made before the Order is processed, prepared, or dispatched. No Order will be fulfilled until cleared payment has been received unless cash on delivery mode of payment is agreed upon.",
      },
      {
        heading: "5.2 Accepted Payment Methods",
        body: "Createch Hobbies accepts payment through the following methods: M-Pesa (Lipa na M-Pesa / Paybill), Airtel Money, Credit or Debit Card (Visa / Mastercard) via our secured payment gateway, and Cash at events and cafe/market setups. The Company shall not be responsible for cash tendered to anyone except Createch Hobbies' representative.",
      },
      {
        heading: "5.3 Payment Verification",
        body: "For mobile money payments, the Customer must provide the transaction reference number and/or confirmation message upon request. The Company reserves the right to hold an Order pending payment verification.",
      },
      {
        heading: "5.4 Failed or Incorrect Payments",
        body: "Where a payment fails or an incorrect amount is received, the Order will not be processed until the correct payment is confirmed. The Customer will be notified within one (1) Business Day. Any overpayment will be refunded within five (5) Business Days.",
      },
      {
        heading: "5.5 Receipts and Records",
        body: "A receipt or payment confirmation will be issued for every completed transaction. Customers are advised to retain proof of payment for a minimum of thirty (30) days from the date of purchase. An ETR will be shared upon request.",
      },
      {
        heading: "5.6 Currency",
        body: "All transactions are conducted in Kenya Shillings (KES). The Company does not accept foreign currency.",
      },
      {
        heading: "5.7 No Credit Facility",
        body: "Createch Hobbies does not extend credit or offer buy-now-pay-later arrangements unless a separate written agreement has been executed between the Company and the Customer.",
      },
    ],
  },
  {
    title: "6. Delivery and Collection",
    content: [
      "6.1 Products will be arranged for delivery at the Customer's cost and risk, unless otherwise agreed.",
      "6.2 Delivery timelines are estimates only and are not guaranteed. The Company shall not be liable for delays caused by third-party couriers, adverse weather, road conditions, or other circumstances beyond our control.",
      "6.3 Risk of loss or damage to Products passes to the Customer upon handover to the courier or upon collection in-store.",
      "6.4 The Customer must inspect all Products upon collection or delivery and report any visible damage or shortages immediately and in any event no later than twenty-four (24) hours after receipt.",
    ],
  },
  {
    title: "7. Returns, Refunds, and Exchanges",
    subsections: [
      {
        heading: "7.1 General Policy",
        body: "All sales are final. Createch Hobbies does not offer refunds or exchanges except in the specific circumstances set out below.",
      },
      {
        heading: "7.2 Damaged Products",
        body: "Refunds are only available where a Product is proven to be damaged, defective, or materially different from what was ordered. The Customer must notify Createch Hobbies within seven (7) calendar days of the purchase date, provide clear photographic or video evidence, and return the Product in its original packaging with all accessories included. Damage caused by misuse, tampering, improper assembly, or normal wear and tear shall not qualify.",
      },
      {
        heading: "7.3 Refund Process",
        body: "Where a valid refund claim is approved, refunds will be processed within seven (7) Business Days of approval using the same payment method as the original transaction wherever possible.",
      },
    ],
  },
  {
    title: "8. Warranties and Product Liability",
    content: [
      "8.1 Products sold by Createch Hobbies carry a 7-day warranty for defects or missing parts. Warranty claims must be made directly to Createch Hobbies via WhatsApp at +254 742152233, via email at createch.hobbies@gmail.com, or physically at any location where Createch Hobbies is vending.",
      "8.2 Createch Hobbies does not provide any additional warranties beyond defects or missing parts.",
      "8.3 The Company shall not be liable for any indirect, incidental, or consequential loss, including loss of profit, loss of data, or personal injury, arising from the use or misuse of any Product, except where such liability cannot be excluded under Kenyan law.",
      "8.4 The Company's total aggregate liability to any Customer shall not exceed the total amount paid by that Customer for the Product(s) giving rise to the claim.",
    ],
  },
  {
    title: "9. Intellectual Property",
    content: [
      "9.1 All content on the Createch Hobbies website, social media channels, and marketing materials, including logos, images, product descriptions, and branding, is the property of the Company or its licensed suppliers and is protected under Kenyan intellectual property laws.",
      "9.2 Customers may not reproduce, redistribute, or commercially exploit any Company content without prior written permission.",
    ],
  },
  {
    title: "10. Customer Data and Privacy",
    content: [
      "10.1 Createch Hobbies collects and processes customer personal data (including names, phone numbers, and payment references) solely for the purpose of processing Orders, communicating regarding transactions, and improving our services.",
      "10.2 Customer data is handled in accordance with the Kenya Data Protection Act, 2019. We do not sell or share personal data with third parties for marketing purposes without the Customer's consent.",
      "10.3 Mobile money transaction data is subject to the privacy policies of Safaricom (M-Pesa) and Airtel Kenya (Airtel Money) respectively.",
    ],
  },
  {
    title: "11. Customer Conduct",
    content: [
      "11.1 Customers are expected to engage with Createch Hobbies staff and representatives in a respectful and professional manner. The Company reserves the right to refuse service to any individual who engages in abusive, threatening, or fraudulent behaviour.",
      "11.2 Any attempt to present false proof of payment, manipulate transaction records, or commit fraud will be reported to the relevant authorities, including the Directorate of Criminal Investigations (DCI) and Communications Authority of Kenya where applicable.",
    ],
  },
  {
    title: "12. Dispute Resolution",
    content: [
      "12.1 In the event of a dispute arising from a transaction, the Customer is encouraged to first contact Createch Hobbies directly to seek an amicable resolution.",
      "12.2 Where a dispute cannot be resolved informally within fourteen (14) Business Days, either party may refer the matter to mediation under the Nairobi Centre for International Arbitration (NCIA) rules, or seek redress through the Consumer Federation of Kenya (COFEK) or the relevant court of competent jurisdiction in Nairobi, Kenya.",
      "12.3 These Terms shall be construed in accordance with the laws of the Republic of Kenya.",
    ],
  },
  {
    title: "13. Force Majeure",
    content: [
      "The Company shall not be held liable for failure or delay in performing its obligations under these Terms where such failure or delay arises from circumstances beyond the Company's reasonable control, including but not limited to acts of God, government action, network or power outages, civil unrest, or public health emergencies.",
    ],
  },
  {
    title: "14. Contact Information",
    contact: true,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 bg-brand-dark">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Legal
          </span>
          <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-white mt-5 mb-4">
            Terms and <em className="text-gradient not-italic">Conditions</em>
          </h1>
          <p className="text-white/45 text-base font-inter">
            Effective Date: 1st July 2025. Nairobi, Kenya.
          </p>
        </div>

        {/* Intro */}
        <div
          className="rounded-2xl p-6 mb-10"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-white/60 text-sm font-inter leading-relaxed">
            These Terms and Conditions ("Terms") govern all purchases, transactions, and interactions between Createch Enterprises LLP (also known as "Createch Hobbies") and any customer who purchases products or services from us, whether in-store, via our website, or through any other channel. By placing an order or making a purchase, you agree to be bound by these Terms in their entirety.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-playfair font-bold text-white text-xl mb-4 pb-3"
                style={{ borderBottom: "1px solid rgba(117,67,152,0.25)" }}>
                {section.title}
              </h2>

              {section.content && (
                <ul className="space-y-3">
                  {section.content.map((line, i) => (
                    <li key={i} className="text-white/60 text-sm font-inter leading-relaxed">
                      {line}
                    </li>
                  ))}
                </ul>
              )}

              {section.subsections && (
                <div className="space-y-5">
                  {section.subsections.map((sub) => (
                    <div key={sub.heading}>
                      <h3 className="font-inter font-semibold text-white/85 text-sm mb-2">
                        {sub.heading}
                      </h3>
                      <p className="text-white/60 text-sm font-inter leading-relaxed">
                        {sub.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {section.contact && (
                <div className="space-y-3 text-sm font-inter text-white/60">
                  <p>For queries, complaints, or refund requests, contact us through:</p>
                  <ul className="space-y-2 mt-3">
                    <li>
                      <span className="text-white/40 text-xs uppercase tracking-wider">Email: </span>
                      <a href="mailto:createch.hobbies@gmail.com" className="text-brand-purple hover:text-brand-purple-light transition-colors">
                        createch.hobbies@gmail.com
                      </a>
                    </li>
                    <li>
                      <span className="text-white/40 text-xs uppercase tracking-wider">Phone / WhatsApp: </span>
                      <a href="https://wa.me/254742152233" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:text-brand-purple-light transition-colors">
                        +254 742 152 233
                      </a>
                    </li>
                    <li>
                      <span className="text-white/40 text-xs uppercase tracking-wider">Address: </span>
                      <span>Laxcon Court and Plaza, Mall Section, Ground Floor, 3B, Nairobi, Kenya</span>
                    </li>
                    <li>
                      <span className="text-white/40 text-xs uppercase tracking-wider">Business Hours: </span>
                      <span>Monday to Friday, 9:00 AM to 5:00 PM EAT</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Acceptance */}
        <div
          className="rounded-2xl p-6 mt-12"
          style={{
            background: "linear-gradient(135deg, rgba(117,67,152,0.12) 0%, rgba(117,67,152,0.06) 100%)",
            border: "1px solid rgba(117,67,152,0.25)",
          }}
        >
          <h3 className="font-playfair font-bold text-white text-lg mb-3">Acceptance of Terms</h3>
          <p className="text-white/60 text-sm font-inter leading-relaxed">
            By purchasing any product from Createch Hobbies, whether in-store, online, or through any other channel, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions in full.
          </p>
        </div>

        <div className="text-center mt-10">
          <Link href="/shop" className="text-brand-purple text-sm font-inter hover:underline font-semibold">
            Browse all kits
          </Link>
          <span className="text-white/20 mx-3">|</span>
          <Link href="/contact" className="text-brand-purple text-sm font-inter hover:underline font-semibold">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
