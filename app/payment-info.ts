// Default bank transfer details for paid passes. Shown on every priced
// ticket unless an organizer overrides it from the admin's "Payment
// instructions" field, which still appends below as free-form text (e.g.
// for adding Easypaisa or JazzCash numbers later).
export const DEFAULT_BANK_DETAILS = [
  { label: "Account title", value: "SALIK AHMED" },
  { label: "Bank", value: "Meezan Bank — Dastagir Society Br" },
  { label: "Account number", value: "10190106276346" },
  { label: "IBAN", value: "PK49MEZN0010190106276346" },
] as const;

/** Plain-text version, used as the admin's default field value so it isn't
 *  blank the first time someone opens Website Content. */
export const DEFAULT_PAYMENT_TEXT = DEFAULT_BANK_DETAILS.map(
  (row) => `${row.label}: ${row.value}`,
).join("\n");
