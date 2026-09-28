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

/** Regions with a known fee schedule; anything else has no schedule to price with. */
const ALLOWED_REGIONS = ["eu-west", "us-east", "ap-south"] as const;

export function validateInvoice(body: InvoiceRequest): string | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return "request body must be a JSON object";
  }

  if (typeof body.customerId !== "string" || body.customerId.trim() === "") {
    return "customerId is required and must be a non-empty string";
  }

  if (typeof body.amount !== "number" || !Number.isFinite(body.amount)) {
    return "amount must be a number";
  }
  if (!Number.isInteger(body.amount)) {
    return "amount must be an integer number of minor units";
  }
  if (body.amount <= 0) {
    return "amount must be greater than zero";
  }

  if (body.currency !== undefined && (typeof body.currency !== "string" || !/^[A-Z]{3}$/.test(body.currency))) {
    return "currency must be a 3-letter ISO 4217 code (e.g. EUR)";
  }

  if (body.region !== undefined && !ALLOWED_REGIONS.includes(body.region as (typeof ALLOWED_REGIONS)[number])) {
    return `region must be one of: ${ALLOWED_REGIONS.join(", ")}`;
  }

  if (body.memo !== undefined && typeof body.memo !== "string") {
    return "memo must be a string";
  }

  return null;
}

export function createInvoice(body: InvoiceRequest): ApiResponse {
  const problem = validateInvoice(body);
  if (problem) return { status: 400, body: { error: problem } };
  const customerId = (body.customerId as string).trim();
  const region = body.region ?? "eu-west";
  const fee = applyFee(body.amount as number, feeScheduleFor(region));
  const invoice: Invoice = {
    id: `inv_${invoices.length + 1}`,
    customerId,
    amount: body.amount as number,
    fee,
    currency: body.currency ?? "EUR",
    memo: body.memo ?? "",
  };
  invoices.push(invoice);
  return { status: 201, body: { ...invoice } };
}

export function listInvoices(): ApiResponse {
  return { status: 200, body: { invoices: [...invoices] } };
}
