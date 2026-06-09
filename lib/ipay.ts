import crypto from "crypto";

export const IPAY_URL = "https://payments.ipayafrica.com/v3/ke";

const MC_MAP: Record<string, string> = {
  mpesa:  "mpesa",
  airtel: "airtelmoney",
};

export const IPAY_STATUS = {
  SUCCESS: "aei7p7yrx4ae34",
  PENDING: "bdi6p2yy76etrs",
  FAILED:  "fe2707etr5s4wq",
  LESS:    "dtfi4p7yty45wq",
} as const;

export interface IPayFormFields {
  live:    string;
  oid:     string;
  inv:     string;
  ttl:     string;
  tel:     string;
  eml:     string;
  vid:     string;
  curr:    string;
  p1:      string;
  p2:      string;
  p3:      string;
  p4:      string;
  cbk:     string;
  lbk:     string;
  cst:     string;
  crl:     string;
  autopay: string;
  mc?:     string;
  hash:    string;
}

export function buildIPayFields(opts: {
  orderId:       string;
  amount:        number;
  phone:         string;
  email:         string;
  paymentMethod: string;
  cbk:           string;
  lbk:           string;
}): IPayFormFields {
  const vid     = process.env.IPAY_VENDOR_ID ?? "";
  const datakey = process.env.IPAY_DATAKEY ?? "";
  const live    = process.env.NODE_ENV === "production" ? "1" : "0";

  const oid  = opts.orderId;
  const inv  = opts.orderId;
  const ttl  = opts.amount.toFixed(2);
  const tel  = opts.phone.replace(/\D/g, "");
  const eml  = opts.email || "orders@createch-hobbies.co.ke";
  const curr = "KES";
  const p1 = "", p2 = "", p3 = "", p4 = "";
  const cst = "0";
  const crl = "0";
  const mc  = MC_MAP[opts.paymentMethod];

  // Hash field order as specified by iPay Africa v3 documentation
  const hashInput = live + oid + inv + ttl + tel + eml + vid + curr + p1 + p2 + p3 + p4 + opts.cbk + cst + crl + datakey;
  const hash = crypto.createHash("md5").update(hashInput).digest("hex");

  return {
    live, oid, inv, ttl, tel, eml, vid, curr, p1, p2, p3, p4,
    cbk: opts.cbk, lbk: opts.lbk, cst, crl, autopay: "0",
    ...(mc ? { mc } : {}),
    hash,
  };
}
