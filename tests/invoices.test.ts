import assert from "node:assert/strict";
import { test } from "node:test";
import { createInvoice, listInvoices, validateInvoice } from "../src/api/invoices.ts";

test("creates an invoice with the region fee", () => {
  const response = createInvoice({ customerId: "c_1", amount: 100_000, region: "eu-west" });
  assert.equal(response.status, 201);
  assert.equal(response.body.fee, 250);
  assert.equal(listInvoices().status, 200);
});

test("creates an invoice with defaults for currency, region, and memo", () => {
  const response = createInvoice({ customerId: "c_defaults", amount: 5_000 });
  assert.equal(response.status, 201);
  assert.equal(response.body.currency, "EUR");
  assert.equal(response.body.memo, "");
  assert.equal(response.body.customerId, "c_defaults");
});

test("trims the customerId before storing it", () => {
  const response = createInvoice({ customerId: "  c_trim  ", amount: 1_000 });
  assert.equal(response.status, 201);
  assert.equal(response.body.customerId, "c_trim");
});

test("accepts a valid currency and memo", () => {
  const response = createInvoice({
    customerId: "c_full",
    amount: 2_500,
    currency: "USD",
    region: "us-east",
    memo: "March services",
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.currency, "USD");
  assert.equal(response.body.memo, "March services");
});

function assertRejected(body: unknown, expected: RegExp): void {
  const response = createInvoice(body);
  assert.equal(response.status, 400);
  assert.match(String(response.body.error), expected);
}

test("rejects a non-object body", () => {
  assertRejected("not an object", /JSON object/);
  assertRejected([{ customerId: "c", amount: 1 }], /JSON object/);
  assertRejected(null, /JSON object/);
});

test("rejects a missing customerId", () => {
  assertRejected({ amount: 100 }, /customerId is required/);
});

test("rejects a blank customerId", () => {
  assertRejected({ customerId: "   ", amount: 100 }, /customerId is required/);
});

test("rejects a non-string customerId", () => {
  assertRejected({ customerId: 42, amount: 100 }, /customerId must be a string/);
});

test("rejects an overly long customerId", () => {
  assertRejected({ customerId: "x".repeat(65), amount: 100 }, /at most 64 characters/);
});

test("rejects a missing amount", () => {
  assertRejected({ customerId: "c_2" }, /amount is required/);
});

test("rejects a non-numeric amount", () => {
  assertRejected({ customerId: "c_2", amount: "12" }, /amount must be a number/);
});

test("rejects a non-finite amount", () => {
  assertRejected({ customerId: "c_2", amount: Number.POSITIVE_INFINITY }, /finite/);
  assertRejected({ customerId: "c_2", amount: Number.NaN }, /number/);
});

test("rejects a non-integer amount", () => {
  assertRejected({ customerId: "c_2", amount: 10.5 }, /integer/);
});

test("rejects a zero or negative amount", () => {
  assertRejected({ customerId: "c_2", amount: 0 }, /greater than 0/);
  assertRejected({ customerId: "c_2", amount: -100 }, /greater than 0/);
});

test("rejects an invalid currency", () => {
  assertRejected({ customerId: "c_2", amount: 100, currency: "eur" }, /3-letter ISO code/);
  assertRejected({ customerId: "c_2", amount: 100, currency: "EURO" }, /3-letter ISO code/);
  assertRejected({ customerId: "c_2", amount: 100, currency: 978 }, /currency must be a string/);
});

test("rejects an unknown region without throwing", () => {
  assertRejected({ customerId: "c_2", amount: 100, region: "mars" }, /region must be one of/);
  assertRejected({ customerId: "c_2", amount: 100, region: 5 }, /region must be a string/);
});

test("rejects a non-string or overly long memo", () => {
  assertRejected({ customerId: "c_2", amount: 100, memo: 123 }, /memo must be a string/);
  assertRejected({ customerId: "c_2", amount: 100, memo: "x".repeat(501) }, /at most 500 characters/);
});

test("validateInvoice returns null for valid input", () => {
  assert.equal(validateInvoice({ customerId: "c_ok", amount: 100 }), null);
});
