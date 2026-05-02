import { createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getStore } from "@netlify/blobs";
import { _decrypt, _encrypt } from "waelio-utils";
import type { AuthSession } from "./src/shared/auth.ts";
import {
    LEDGER_ENTRY_KINDS,
    LEDGER_REVIEW_ACTIONS,
    type CurrencyAmount,
    type IntegrityFailure,
    type IntegrityOk,
    type IntegrityStatus,
    type LedgerActor,
    type LedgerAuditEvent,
    type LedgerData,
    type LedgerEntry,
    type LedgerEntryInput,
    type LedgerEntryKind,
    type LedgerEntryStatus,
    type LedgerEntryView,
    type LedgerReview,
    type LedgerReviewAction,
    type LedgerReviewInput,
    type LedgerSummary,
    type LedgerViewResponse,
    type Partner,
} from "./src/shared/private-ledger.ts";

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));
const LOCAL_LEDGER_FILE = join(ROOT_DIR, "data", "private-ledger.enc");
const BLOB_STORE_NAME = "waelio-private";
const BLOB_LEDGER_KEY = "finance-ledger";
const DEFAULT_CURRENCY = "USD";
const VALID_ENTRY_TYPES = new Set<LedgerEntryKind>(LEDGER_ENTRY_KINDS);
const VALID_REVIEW_ACTIONS = new Set<LedgerReviewAction>(LEDGER_REVIEW_ACTIONS);
const MONETARY_ENTRY_KINDS = ["debt", "payment", "expense", "income"] as const;

type MonetaryEntryKind = (typeof MONETARY_ENTRY_KINDS)[number];
type CurrencyMap = Record<string, number>;

interface LedgerFailure {
    statusCode: number;
    message: string;
}

interface LedgerViewer extends AuthSession {
    label: string;
}

class LedgerStoreError extends Error {
    readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "LedgerStoreError";
        this.statusCode = statusCode;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isDefined<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

function ledgerError(statusCode: number, message: string): LedgerStoreError {
    return new LedgerStoreError(statusCode, message);
}

export function getLedgerError(error: unknown): LedgerFailure {
    if (error instanceof LedgerStoreError) {
        return {
            statusCode: error.statusCode,
            message: error.message,
        };
    }

    if (error instanceof Error && isRecord(error) && typeof error.statusCode === "number") {
        return {
            statusCode: error.statusCode,
            message: error.message || "Ledger request failed",
        };
    }

    return {
        statusCode: 500,
        message: error instanceof Error && error.message ? error.message : "Ledger request failed",
    };
}

function nowIso(): string {
    return new Date().toISOString();
}

function roundMoney(value: number | string | null | undefined): number {
    return Math.round(Number(value ?? 0) * 100) / 100;
}

function parseBooleanLike(value: unknown): boolean {
    return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

function normalizeEmail(value: unknown): string {
    return String(value ?? "").trim().toLowerCase();
}

function titleCase(value: string): string {
    return value
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function partnerLabelFromEmail(email: string): string {
    const local = email.split("@")[0] || email;
    return titleCase(local || "Partner");
}

function sanitizeText(value: unknown, maxLength = 4000): string {
    return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeCurrency(value: unknown): string {
    const currency = sanitizeText(value || DEFAULT_CURRENCY, 8).toUpperCase();
    return currency || DEFAULT_CURRENCY;
}

function parseAmount(value: unknown): number {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw ledgerError(400, "Amount must be greater than zero");
    }

    return roundMoney(amount);
}

function parseSplitPercent(value: unknown): number {
    const percent = Number(value);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        throw ledgerError(400, "Split percent must be between 0 and 100");
    }

    return roundMoney(percent);
}

function normalizeStoredSplitPercent(value: unknown): number {
    const percent = Number(value);
    if (!Number.isFinite(percent)) return 50;
    return Math.min(100, Math.max(0, roundMoney(percent)));
}

function normalizeStatus(value: unknown): LedgerEntryStatus {
    const status = sanitizeText(value, 24).toLowerCase();
    if (status === "approved" || status === "rejected") {
        return status;
    }

    return "pending";
}

function isLedgerEntryKind(value: string): value is LedgerEntryKind {
    return VALID_ENTRY_TYPES.has(value as LedgerEntryKind);
}

function isLedgerReviewAction(value: string): value is LedgerReviewAction {
    return VALID_REVIEW_ACTIONS.has(value as LedgerReviewAction);
}

function normalizeActor(value: unknown): LedgerActor {
    if (!isRecord(value)) {
        return { email: "", name: "Unknown" };
    }

    const email = normalizeEmail(value.email);
    return {
        email,
        name: sanitizeText(value.name || email || "Unknown", 120) || "Unknown",
    };
}

function normalizeReview(value: unknown): LedgerReview | null {
    if (!isRecord(value)) return null;

    const action = sanitizeText(value.action, 24).toLowerCase();
    if (!isLedgerReviewAction(action)) return null;

    return {
        action,
        at: sanitizeText(value.at, 64) || nowIso(),
        note: sanitizeText(value.note, 1000),
        by: normalizeActor(value.by),
    };
}

function normalizeEntry(value: unknown): LedgerEntry | null {
    if (!isRecord(value)) return null;

    const kind = sanitizeText(value.kind, 24).toLowerCase();
    if (!isLedgerEntryKind(kind)) return null;

    const base = {
        id: sanitizeText(value.id, 80) || randomUUID(),
        title: sanitizeText(value.title, 140) || "Untitled entry",
        details: sanitizeText(value.details, 4000),
        isMaybe: parseBooleanLike(value.isMaybe),
        status: normalizeStatus(value.status),
        createdAt: sanitizeText(value.createdAt, 64) || nowIso(),
        createdBy: normalizeActor(value.createdBy),
        review: normalizeReview(value.review),
    };

    if (kind === "note") {
        return {
            ...base,
            kind: "note",
            amount: null,
            currency: null,
            subjectEmail: null,
            counterpartyEmail: null,
            splitPercent: null,
        };
    }

    const amount = Number(value.amount);
    const subjectEmail = normalizeEmail(value.subjectEmail);
    const counterpartyEmail = normalizeEmail(value.counterpartyEmail);
    if (!Number.isFinite(amount) || amount <= 0 || !subjectEmail || !counterpartyEmail) {
        return null;
    }

    return {
        ...base,
        kind,
        amount: roundMoney(amount),
        currency: normalizeCurrency(value.currency),
        subjectEmail,
        counterpartyEmail,
        splitPercent: kind === "expense" || kind === "income"
            ? normalizeStoredSplitPercent(value.splitPercent)
            : null,
    };
}

function normalizeAuditEvent(value: unknown): LedgerAuditEvent | null {
    if (!isRecord(value)) return null;

    const entryType = sanitizeText(value.entryType, 24).toLowerCase();
    if (!isLedgerEntryKind(entryType)) return null;

    return {
        id: sanitizeText(value.id, 80) || randomUUID(),
        at: sanitizeText(value.at, 64) || nowIso(),
        type: sanitizeText(value.type, 64) || "unknown",
        actorEmail: normalizeEmail(value.actorEmail),
        actorName: sanitizeText(value.actorName, 120) || "Unknown",
        entryId: sanitizeText(value.entryId, 80),
        entryType,
        status: normalizeStatus(value.status),
        hash: sanitizeText(value.hash, 128),
    };
}

function normalizeLedger(value: unknown): LedgerData {
    const createdAt = nowIso();
    if (!isRecord(value)) {
        return {
            version: 1,
            createdAt,
            updatedAt: createdAt,
            entries: [],
            audit: [],
        };
    }

    const rawEntries = Array.isArray(value.entries) ? value.entries : [];
    const rawAudit = Array.isArray(value.audit) ? value.audit : [];

    return {
        version: Number(value.version) || 1,
        createdAt: sanitizeText(value.createdAt, 64) || createdAt,
        updatedAt: sanitizeText(value.updatedAt, 64) || createdAt,
        entries: rawEntries.map((entry) => normalizeEntry(entry)).filter(isDefined),
        audit: rawAudit.map((event) => normalizeAuditEvent(event)).filter(isDefined),
    };
}

function getLedgerSecret(): string {
    return process.env.LEDGER_SECRET || process.env.AUTH_SECRET || "change-me-in-production";
}

function createAuditHash(
    previousHash: string,
    payload: Omit<LedgerAuditEvent, "hash">,
): string {
    return createHmac("sha256", getLedgerSecret())
        .update(`${previousHash}|${JSON.stringify(payload)}`)
        .digest("hex");
}

function appendAudit(
    ledger: LedgerData,
    event: Omit<LedgerAuditEvent, "id" | "at" | "hash">,
): void {
    const previousHash = ledger.audit.at(-1)?.hash || "root";
    const payload: Omit<LedgerAuditEvent, "hash"> = {
        id: randomUUID(),
        at: nowIso(),
        ...event,
    };
    const hash = createAuditHash(previousHash, payload);
    ledger.audit.push({ ...payload, hash });
}

function verifyAuditChain(audit: LedgerAuditEvent[]): IntegrityStatus {
    let previousHash = "root";

    for (const event of audit) {
        const { hash, ...payload } = event;
        const expectedHash = createAuditHash(previousHash, payload);
        if (hash !== expectedHash) {
            const failure: IntegrityFailure = {
                ok: false,
                reason: `Audit chain mismatch at ${payload.id || "unknown event"}`,
            };
            return failure;
        }

        previousHash = hash;
    }

    const ok: IntegrityOk = {
        ok: true,
        events: audit.length,
    };
    return ok;
}

function isNetlifyRuntime(): boolean {
    return Boolean(
        process.env.NETLIFY_BLOBS_CONTEXT
        || process.env.netlifyBlobsContext
        || process.env.NETLIFY
        || process.env.CONTEXT,
    );
}

async function readLedgerPayload(): Promise<string | null> {
    if (isNetlifyRuntime()) {
        const payload = await getStore(BLOB_STORE_NAME).get(BLOB_LEDGER_KEY, { type: "text" });
        return payload || null;
    }

    try {
        return await readFile(LOCAL_LEDGER_FILE, "utf8");
    } catch (error) {
        if (isRecord(error) && error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}

async function writeLedgerPayload(payload: string): Promise<void> {
    if (isNetlifyRuntime()) {
        await getStore(BLOB_STORE_NAME).set(BLOB_LEDGER_KEY, payload);
        return;
    }

    await mkdir(dirname(LOCAL_LEDGER_FILE), { recursive: true });
    await writeFile(LOCAL_LEDGER_FILE, payload, "utf8");
}

async function loadLedger(): Promise<LedgerData> {
    const payload = await readLedgerPayload();
    if (!payload) return normalizeLedger(null);

    try {
        const decrypted = _decrypt(payload, getLedgerSecret()) as unknown;
        if (!decrypted) return normalizeLedger(null);
        if (typeof decrypted === "string") {
            return normalizeLedger(JSON.parse(decrypted) as unknown);
        }

        return normalizeLedger(decrypted);
    } catch {
        throw ledgerError(500, "Unable to decrypt finance ledger");
    }
}

async function saveLedger(ledger: LedgerData): Promise<LedgerData> {
    const snapshot: LedgerData = {
        ...ledger,
        updatedAt: nowIso(),
    };

    const encrypted = _encrypt(snapshot, getLedgerSecret()) as unknown;
    if (typeof encrypted !== "string" || !encrypted) {
        throw ledgerError(500, "Unable to encrypt finance ledger");
    }

    await writeLedgerPayload(encrypted);
    return snapshot;
}

export function getPartners(rawAllowedEmails: string | string[] | undefined): Partner[] {
    const seen = new Set<string>();
    const values = Array.isArray(rawAllowedEmails)
        ? rawAllowedEmails
        : String(rawAllowedEmails ?? "").split(",");

    const partners = values
        .map((value) => normalizeEmail(value))
        .filter(Boolean)
        .filter((email) => {
            if (seen.has(email)) return false;
            seen.add(email);
            return true;
        })
        .map((email) => ({
            email,
            label: partnerLabelFromEmail(email),
        }));

    if (partners.length < 2) {
        throw ledgerError(
            500,
            "Set at least two partner emails in ALLOWED_EMAILS before using the private ledger",
        );
    }

    return partners;
}

function getPartnerByEmail(partners: Partner[], email: string | null | undefined): Partner | null {
    const normalizedEmail = normalizeEmail(email);
    return partners.find((partner) => partner.email === normalizedEmail) ?? null;
}

function getOtherPartner(partners: Partner[], email: string | null | undefined): Partner | null {
    const normalizedEmail = normalizeEmail(email);
    return partners.find((partner) => partner.email !== normalizedEmail) ?? null;
}

function requirePartnerSession(session: AuthSession | null, partners: Partner[]): LedgerViewer {
    const email = normalizeEmail(session?.email);
    if (!email) {
        throw ledgerError(401, "Not authenticated");
    }

    const partner = getPartnerByEmail(partners, email);
    if (!partner) {
        throw ledgerError(403, "This account is not allowed to access the shared ledger");
    }

    return {
        email,
        name: sanitizeText(session?.name || partner.label, 120) || partner.label,
        picture: sanitizeText(session?.picture, 2048),
        label: partner.label,
    };
}

function createEntryRecord(input: unknown, actor: LedgerViewer, partners: Partner[]): LedgerEntry {
    if (!isRecord(input)) {
        throw ledgerError(400, "Invalid ledger entry payload");
    }

    const kind = sanitizeText(input.kind, 24).toLowerCase();
    if (!isLedgerEntryKind(kind)) {
        throw ledgerError(400, "Choose a valid ledger entry type");
    }

    const title = sanitizeText(input.title, 140);
    const details = sanitizeText(input.details, 4000);
    const isMaybe = parseBooleanLike(input.isMaybe);
    if (!title) {
        throw ledgerError(400, "Title is required");
    }

    const base = {
        id: randomUUID(),
        title,
        details,
        isMaybe,
        status: "pending" as const,
        createdAt: nowIso(),
        createdBy: {
            email: actor.email,
            name: actor.name,
        },
        review: null,
    };

    if (kind === "note") {
        return {
            ...base,
            kind: "note",
            amount: null,
            currency: null,
            subjectEmail: null,
            counterpartyEmail: null,
            splitPercent: null,
        };
    }

    const subjectEmail = normalizeEmail(input.subjectEmail);
    const subjectPartner = getPartnerByEmail(partners, subjectEmail);
    const counterpartyPartner = getOtherPartner(partners, subjectEmail);

    if (!subjectPartner || !counterpartyPartner) {
        throw ledgerError(400, "Choose which partner the amount belongs to");
    }

    return {
        ...base,
        kind,
        amount: parseAmount(input.amount),
        currency: normalizeCurrency(input.currency),
        subjectEmail: subjectPartner.email,
        counterpartyEmail: counterpartyPartner.email,
        splitPercent: kind === "expense" || kind === "income"
            ? parseSplitPercent(input.splitPercent ?? 50)
            : null,
    };
}

function createCurrencyMap(): CurrencyMap {
    return Object.create(null) as CurrencyMap;
}

function addCurrencyAmount(map: CurrencyMap, currency: string, amount: number): void {
    const key = normalizeCurrency(currency);
    map[key] = roundMoney((map[key] || 0) + roundMoney(amount));
}

function serializeCurrencyMap(map: CurrencyMap): CurrencyAmount[] {
    return Object.entries(map)
        .filter(([, amount]) => Math.abs(amount) >= 0.01)
        .sort(([leftCurrency], [rightCurrency]) => leftCurrency.localeCompare(rightCurrency))
        .map(([currency, amount]) => ({
            currency,
            amount: roundMoney(amount),
        }));
}

function getEmptyOwedMap(partners: Partner[]): Record<string, number> {
    return Object.fromEntries(partners.map((partner) => [partner.email, 0])) as Record<string, number>;
}

function describeEntry(entry: LedgerEntry, partners: Partner[]): string {
    const subject = getPartnerByEmail(partners, entry.subjectEmail);
    const counterparty = getPartnerByEmail(partners, entry.counterpartyEmail);
    const subjectLabel = subject?.label || entry.subjectEmail || "Partner";
    const counterpartyLabel = counterparty?.label || entry.counterpartyEmail || "Partner";

    switch (entry.kind) {
        case "debt":
            return `${subjectLabel} owes ${counterpartyLabel}`;
        case "payment":
            return `${subjectLabel} paid ${counterpartyLabel}`;
        case "expense":
            return `${subjectLabel} paid a shared expense`;
        case "income":
            return `${subjectLabel} received shared income`;
        case "note":
            return "Shared note";
    }
}

function decorateEntry(entry: LedgerEntry, partners: Partner[], viewer: LedgerViewer): LedgerEntryView {
    const subject = getPartnerByEmail(partners, entry.subjectEmail);
    const counterparty = getPartnerByEmail(partners, entry.counterpartyEmail);
    const createdByPartner = getPartnerByEmail(partners, entry.createdBy.email);
    const reviewedByPartner = entry.review ? getPartnerByEmail(partners, entry.review.by.email) : null;

    return {
        ...entry,
        subjectLabel: subject?.label ?? null,
        counterpartyLabel: counterparty?.label ?? null,
        createdByLabel: createdByPartner?.label || entry.createdBy.name || entry.createdBy.email || "Unknown",
        reviewerLabel: reviewedByPartner?.label || entry.review?.by.name || entry.review?.by.email || null,
        descriptionLine: describeEntry(entry, partners),
        canReview:
            entry.status === "pending"
            && normalizeEmail(entry.createdBy.email) !== normalizeEmail(viewer.email),
    };
}

function summarizeLedger(ledger: LedgerData, partners: Partner[]): LedgerSummary {
    const integrity = verifyAuditChain(ledger.audit);
    const totals: Record<MonetaryEntryKind, CurrencyMap> = {
        debt: createCurrencyMap(),
        payment: createCurrencyMap(),
        expense: createCurrencyMap(),
        income: createCurrencyMap(),
    };
    const owesByCurrency: Record<string, Record<string, number>> = Object.create(null) as Record<string, Record<string, number>>;

    const pendingCount = ledger.entries.filter((entry) => entry.status === "pending").length;
    const approvedEntries = ledger.entries.filter((entry) => entry.status === "approved");
    const rejectedCount = ledger.entries.filter((entry) => entry.status === "rejected").length;

    for (const entry of approvedEntries) {
        if (entry.kind === "note") continue;

        addCurrencyAmount(totals[entry.kind], entry.currency, entry.amount);
        const currencyBalances = owesByCurrency[entry.currency] ||= getEmptyOwedMap(partners);

        switch (entry.kind) {
            case "debt":
                currencyBalances[entry.subjectEmail] = roundMoney(
                    (currencyBalances[entry.subjectEmail] ?? 0) + entry.amount,
                );
                break;
            case "payment":
                currencyBalances[entry.subjectEmail] = roundMoney(
                    (currencyBalances[entry.subjectEmail] ?? 0) - entry.amount,
                );
                break;
            case "expense": {
                const share = roundMoney(entry.amount * ((entry.splitPercent || 50) / 100));
                currencyBalances[entry.counterpartyEmail] = roundMoney(
                    (currencyBalances[entry.counterpartyEmail] ?? 0) + share,
                );
                break;
            }
            case "income": {
                const share = roundMoney(entry.amount * ((entry.splitPercent || 50) / 100));
                currencyBalances[entry.subjectEmail] = roundMoney(
                    (currencyBalances[entry.subjectEmail] ?? 0) + share,
                );
                break;
            }
        }
    }

    const settlements = [] as LedgerSummary["settlements"];
    const partnerBalances = partners.map((partner) => ({
        email: partner.email,
        label: partner.label,
        amounts: [] as CurrencyAmount[],
    }));

    for (const [currency, map] of Object.entries(owesByCurrency)) {
        const [firstPartner, secondPartner] = partners;
        if (!firstPartner || !secondPartner) continue;

        const firstAmount = roundMoney(map[firstPartner.email] || 0);
        const secondAmount = roundMoney(map[secondPartner.email] || 0);

        partnerBalances[0]?.amounts.push({ currency, amount: firstAmount });
        partnerBalances[1]?.amounts.push({ currency, amount: secondAmount });

        const net = roundMoney(firstAmount - secondAmount);
        if (Math.abs(net) < 0.01) continue;

        settlements.push(
            net > 0
                ? {
                    currency,
                    amount: net,
                    fromEmail: firstPartner.email,
                    fromLabel: firstPartner.label,
                    toEmail: secondPartner.email,
                    toLabel: secondPartner.label,
                }
                : {
                    currency,
                    amount: Math.abs(net),
                    fromEmail: secondPartner.email,
                    fromLabel: secondPartner.label,
                    toEmail: firstPartner.email,
                    toLabel: firstPartner.label,
                },
        );
    }

    return {
        pendingCount,
        approvedCount: approvedEntries.length,
        rejectedCount,
        totals: {
            debt: serializeCurrencyMap(totals.debt),
            payment: serializeCurrencyMap(totals.payment),
            expense: serializeCurrencyMap(totals.expense),
            income: serializeCurrencyMap(totals.income),
        },
        partnerBalances: partnerBalances.map((partner) => ({
            ...partner,
            amounts: partner.amounts.filter((item) => Math.abs(item.amount) >= 0.01),
        })),
        settlements,
        integrity,
    };
}

function buildRules(): string[] {
    return [
        "Every finance entry starts as pending and only counts after the other partner approves it.",
        "No silent edits or deletes: if something is wrong, add a correcting entry and let the other partner approve that too.",
        "Every action is tied to the signed-in Google partner email and written to an audit trail.",
        "The ledger is encrypted at rest and includes a tamper-evident audit chain.",
    ];
}

function sortEntries(entries: LedgerEntry[]): LedgerEntry[] {
    return [...entries].sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();
        return rightTime - leftTime;
    });
}

function buildLedgerView(ledger: LedgerData, viewer: LedgerViewer, partners: Partner[]): LedgerViewResponse {
    return {
        viewer,
        partners,
        summary: summarizeLedger(ledger, partners),
        rules: buildRules(),
        entries: sortEntries(ledger.entries).map((entry) => decorateEntry(entry, partners, viewer)),
    };
}

export async function getLedgerView(
    session: AuthSession | null,
    rawAllowedEmails: string | string[] | undefined,
): Promise<LedgerViewResponse> {
    const partners = getPartners(rawAllowedEmails);
    const viewer = requirePartnerSession(session, partners);
    const ledger = await loadLedger();
    return buildLedgerView(ledger, viewer, partners);
}

export async function submitLedgerEntry(
    session: AuthSession | null,
    rawAllowedEmails: string | string[] | undefined,
    input: unknown,
): Promise<LedgerViewResponse> {
    const partners = getPartners(rawAllowedEmails);
    const viewer = requirePartnerSession(session, partners);
    const ledger = await loadLedger();
    const entry = createEntryRecord(input, viewer, partners);

    ledger.entries.push(entry);
    appendAudit(ledger, {
        type: "entry-created",
        actorEmail: viewer.email,
        actorName: viewer.name,
        entryId: entry.id,
        entryType: entry.kind,
        status: entry.status,
    });

    const savedLedger = await saveLedger(ledger);
    return buildLedgerView(savedLedger, viewer, partners);
}

export async function reviewLedgerEntry(
    session: AuthSession | null,
    rawAllowedEmails: string | string[] | undefined,
    input: unknown,
): Promise<LedgerViewResponse> {
    if (!isRecord(input)) {
        throw ledgerError(400, "Invalid ledger review payload");
    }

    const partners = getPartners(rawAllowedEmails);
    const viewer = requirePartnerSession(session, partners);
    const ledger = await loadLedger();
    const entryId = sanitizeText(input.entryId, 80);
    const action = sanitizeText(input.action, 24).toLowerCase();
    const note = sanitizeText(input.note, 1000);

    if (!entryId) {
        throw ledgerError(400, "Entry id is required");
    }

    if (!isLedgerReviewAction(action)) {
        throw ledgerError(400, "Action must be approved or rejected");
    }

    const entry = ledger.entries.find((candidate) => candidate.id === entryId);
    if (!entry) {
        throw ledgerError(404, "Ledger entry not found");
    }

    if (entry.status !== "pending") {
        throw ledgerError(409, "This ledger entry has already been reviewed");
    }

    if (normalizeEmail(entry.createdBy.email) === viewer.email) {
        throw ledgerError(403, "You cannot approve or reject your own entry");
    }

    entry.status = action;
    entry.review = {
        action,
        at: nowIso(),
        note,
        by: {
            email: viewer.email,
            name: viewer.name,
        },
    };

    appendAudit(ledger, {
        type: `entry-${action}`,
        actorEmail: viewer.email,
        actorName: viewer.name,
        entryId: entry.id,
        entryType: entry.kind,
        status: entry.status,
    });

    const savedLedger = await saveLedger(ledger);
    return buildLedgerView(savedLedger, viewer, partners);
}
