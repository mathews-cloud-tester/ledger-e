import assert from "node:assert/strict";
import { test } from "node:test";
import { createInvoice, listInvoices, validateInvoice } from "../src/api/invoices.ts";

test("creates an invoice with the region fee", () => {
  const response = createInvoice({ customerId: "c_1", amount: 100_000, region: "eu-west" });
  assert.equal(response.status, 201);
  assert.equal(response.body.fee, 250);
  assert.equal(listInvoices().status, 200);
});

test("accepts an optional currency and memo", () => {
  const response = createInvoice({ customerId: "c_1", amount: 5_000, currency: "USD", memo: "hosting" });
  assert.equal(response.status, 201);
  assert.equal(response.body.currency, "USD");
  assert.equal(response.body.memo, "hosting");
});

test("defaults currency and memo when omitted", () => {
  const response = createInvoice({ customerId: "c_1", amount: 5_000 });
  assert.equal(response.status, 201);
  assert.equal(response.body.currency, "EUR");
  assert.equal(response.body.memo, "");
});

test("validateInvoice returns null for a valid body", () => {
  assert.equal(validateInvoice({ customerId: "c_1", amount: 100 }), null);
});

test("rejects a non-object body", () => {
  const response = createInvoice(null as never);
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /object/);
});

test("rejects a missing customerId without throwing", () => {
  const response = createInvoice({ amount: 100 });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /customerId/);
});

test("rejects a blank customerId", () => {
  const response = createInvoice({ customerId: "   ", amount: 100 });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /customerId/);
});

test("rejects a missing amount", () => {
  const response = createInvoice({ customerId: "c_2" });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /amount must be a number/);
});

test("rejects a non-numeric amount", () => {
  const response = createInvoice({ customerId: "c_2", amount: "12" as unknown as number });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /amount must be a number/);
});

test("rejects a non-finite amount", () => {
  const response = createInvoice({ customerId: "c_2", amount: Number.POSITIVE_INFINITY });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /amount must be a number/);
});

test("rejects a non-integer amount", () => {
  const response = createInvoice({ customerId: "c_2", amount: 12.5 });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /integer/);
});

test("rejects a zero or negative amount", () => {
  assert.equal(createInvoice({ customerId: "c_2", amount: 0 }).status, 400);
  const response = createInvoice({ customerId: "c_2", amount: -100 });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /greater than zero/);
});

test("rejects a malformed currency", () => {
  const response = createInvoice({ customerId: "c_2", amount: 100, currency: "euro" });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /currency/);
});

test("rejects an unknown region without throwing a 500", () => {
  const response = createInvoice({ customerId: "c_2", amount: 100, region: "mars-1" });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /region/);
});

test("rejects a non-string memo", () => {
  const response = createInvoice({ customerId: "c_2", amount: 100, memo: 42 as unknown as string });
  assert.equal(response.status, 400);
  assert.match(response.body.error as string, /memo/);
});
