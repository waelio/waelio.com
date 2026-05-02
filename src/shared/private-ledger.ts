import type { AuthSession } from "./auth.ts";

export const LEDGER_ENTRY_KINDS = ["debt", "payment", "expense", "income", "note"] as const;
export type LedgerEntryKind = (typeof LEDGER_ENTRY_KINDS)[number];

export const LEDGER_REVIEW_ACTIONS = ["approved", "rejected"] as const;
export type LedgerReviewAction = (typeof LEDGER_REVIEW_ACTIONS)[number];
export type LedgerEntryStatus = "pending" | LedgerReviewAction;

export interface Partner {
    email: string;
    label: string;
}

export interface LedgerActor {
    email: string;
    name: string;
}

export interface LedgerReview {
    action: LedgerReviewAction;
    at: string;
    note: string;
    by: LedgerActor;
}

export interface LedgerEntryBase {
    id: string;
    title: string;
    details: string;
    isMaybe: boolean;
    status: LedgerEntryStatus;
    createdAt: string;
    createdBy: LedgerActor;
    review: LedgerReview | null;
}

export interface NoteLedgerEntry extends LedgerEntryBase {
    kind: "note";
    amount: null;
    currency: null;
    subjectEmail: null;
    counterpartyEmail: null;
    splitPercent: null;
}

export interface MonetaryLedgerEntry extends LedgerEntryBase {
    kind: Exclude<LedgerEntryKind, "note">;
    amount: number;
    currency: string;
    subjectEmail: string;
    counterpartyEmail: string;
    splitPercent: number | null;
}

export type LedgerEntry = NoteLedgerEntry | MonetaryLedgerEntry;

export type LedgerEntryView = LedgerEntry & {
    subjectLabel: string | null;
    counterpartyLabel: string | null;
    createdByLabel: string;
    reviewerLabel: string | null;
    descriptionLine: string;
    canReview: boolean;
};

export interface CurrencyAmount {
    currency: string;
    amount: number;
}

export interface PartnerBalance {
    email: string;
    label: string;
    amounts: CurrencyAmount[];
}

export interface Settlement {
    currency: string;
    amount: number;
    fromEmail: string;
    fromLabel: string;
    toEmail: string;
    toLabel: string;
}

export interface IntegrityOk {
    ok: true;
    events: number;
}

export interface IntegrityFailure {
    ok: false;
    reason: string;
}

export type IntegrityStatus = IntegrityOk | IntegrityFailure;

export interface LedgerTotals {
    debt: CurrencyAmount[];
    payment: CurrencyAmount[];
    expense: CurrencyAmount[];
    income: CurrencyAmount[];
}

export interface LedgerSummary {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totals: LedgerTotals;
    partnerBalances: PartnerBalance[];
    settlements: Settlement[];
    integrity: IntegrityStatus;
}

export interface LedgerViewResponse {
    viewer: AuthSession;
    partners: Partner[];
    summary: LedgerSummary;
    rules: string[];
    entries: LedgerEntryView[];
}

export interface LedgerEntryInput {
    kind: LedgerEntryKind;
    title: string;
    details: string;
    isMaybe?: boolean;
    subjectEmail?: string;
    amount?: string | number;
    currency?: string;
    splitPercent?: string | number;
}

export interface LedgerReviewInput {
    entryId: string;
    action: LedgerReviewAction;
    note: string;
}

export interface LedgerAuditEvent {
    id: string;
    at: string;
    type: string;
    actorEmail: string;
    actorName: string;
    entryId: string;
    entryType: LedgerEntryKind;
    status: LedgerEntryStatus;
    hash: string;
}

export interface LedgerData {
    version: number;
    createdAt: string;
    updatedAt: string;
    entries: LedgerEntry[];
    audit: LedgerAuditEvent[];
}
