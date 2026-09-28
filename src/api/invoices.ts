import { applyFee, feeScheduleFor } from "../ledger/index.ts";

export interface InvoiceRequest {
  customerId?: string;
  amount?: number;
  currency?: string;
  region?: string;
  memo?: string;
}

export interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  fee: number;
  currency: string;
  memo: string;
}

const invoices: Invoice[] = [];

const KNOWN_REGIONS = ["eu-west", "us-east", "ap-south"];
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_CUSTOMER_ID_LENGTH = 64;
const MAX_MEMO_LENGTH = 500;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateInvoice(body: unknown): string | null {
  if (!isPlainObject(body)) return "request body must be a JSON object";

  const { customerId, amount, currency, region, memo } = body as InvoiceRequest;

  if (customerId === undefined || customerId === null) return "customerId is required";
  if (typeof customerId !== "string") return "customerId must be a string";
  if (customerId.trim().length === 0) return "customerId is required";
  if (customerId.trim().length > MAX_CUSTOMER_ID_LENGTH) {
    return `customerId must be at most ${MAX_CUSTOMER_ID_LENGTH} characters`;
  }

  if (amount === undefined || amount === null) return "amount is required";
  if (typeof amount !== "number") return "amount must be a number";
  if (!Number.isFinite(amount)) return "amount must be a finite number";
  if (!Number.isInteger(amount)) return "amount must be an integer number of minor units";
  if (amount <= 0) return "amount must be greater than 0";
  if (amount > Number.MAX_SAFE_INTEGER) return "amount is too large";

  if (currency !== undefined) {
    if (typeof currency !== "string") return "currency must be a string";
    if (!CURRENCY_PATTERN.test(currency)) return "currency must be a 3-letter ISO code (e.g. EUR)";
  }

  if (region !== undefined) {
    if (typeof region !== "string") return "region must be a string";
    if (!KNOWN_REGIONS.includes(region)) {
      return `region must be one of: ${KNOWN_REGIONS.join(", ")}`;
    }
  }

  if (memo !== undefined) {
    if (typeof memo !== "string") return "memo must be a string";
    if (memo.length > MAX_MEMO_LENGTH) return `memo must be at most ${MAX_MEMO_LENGTH} characters`;
  }

  return null;
}

export function createInvoice(body: unknown): ApiResponse {
  const problem = validateInvoice(body);
  if (problem) return { status: 400, body: { error: problem } };

  const { customerId, amount, currency, region, memo } = body as InvoiceRequest;
  const resolvedRegion = region ?? "eu-west";
  const fee = applyFee(amount as number, feeScheduleFor(resolvedRegion));
  const invoice: Invoice = {
    id: `inv_${invoices.length + 1}`,
    customerId: (customerId as string).trim(),
    amount: amount as number,
    fee,
    currency: currency ?? "EUR",
    memo: memo ?? "",
  };
  invoices.push(invoice);
  return { status: 201, body: { ...invoice } };
}

export function listInvoices(): ApiResponse {
  return { status: 200, body: { invoices: [...invoices] } };
}
