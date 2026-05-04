import type { ApiErrorResponse } from "./shared/auth.ts";
import type {
    LedgerEntryInput,
    LedgerEntryKind,
    LedgerEntryView,
    LedgerReviewAction,
    LedgerReviewInput,
    LedgerViewResponse,
    Partner,
} from "./shared/private-ledger.ts";

type StatusTone = "info" | "success" | "warning" | "error";

type SuggestionSource = "ai" | "fallback";

interface LedgerEntrySuggestion {
    title: string;
    details: string;
    source: SuggestionSource;
}

interface LedgerEntrySuggestionContext {
    kind: LedgerEntryKind;
    subjectLabel: string;
    counterpartyLabel: string;
    amount: string;
    currency: string;
    splitPercent: string;
    title: string;
    details: string;
    isMaybe: boolean;
}

interface AiPromptSession {
    prompt(input: string): Promise<string>;
    destroy?: () => void;
}

interface BrowserLanguageModelFactory {
    create(): Promise<AiPromptSession>;
}

declare global {
    interface Window {
        ai?: {
            languageModel?: BrowserLanguageModelFactory;
        };
        LanguageModel?: BrowserLanguageModelFactory;
    }
}

interface AppState {
    data: LedgerViewResponse | null;
}

const DEFAULT_CURRENCY = "USD";
const MAYBE_PREFIX = "Maybe / needs confirmation: ";
const MAYBE_ONLY_MESSAGE = "Maybe / needs confirmation.";
const LOGOUT_ENDPOINT = "/api/logout";

const state: AppState = {
    data: null,
};

let hasTriggeredExitLogout = false;

const backButton = requireElement<HTMLAnchorElement>("back-btn");
const userNameEl = requireElement<HTMLSpanElement>("user-name");
const greetingTextEl = requireElement<HTMLHeadingElement>("greeting-text");
const introTextEl = requireElement<HTMLParagraphElement>("greeting-intro");
const summaryGridEl = requireElement<HTMLElement>("summary-grid");
const rulesListEl = requireElement<HTMLUListElement>("rules-list");
const pendingListEl = requireElement<HTMLElement>("pending-list");
const entryListEl = requireElement<HTMLElement>("entry-list");
const ledgerForm = requireElement<HTMLFormElement>("ledger-form");
const submitButton = requireElement<HTMLButtonElement>("ledger-submit-btn");
const aiButton = requireElement<HTMLButtonElement>("ledger-ai-btn");
const formStatusEl = requireElement<HTMLDivElement>("form-status");
const pageStatusEl = requireElement<HTMLDivElement>("page-status");
const kindField = requireElement<HTMLSelectElement>("entry-kind");
const subjectField = requireElement<HTMLSelectElement>("entry-subject");
const titleInput = requireElement<HTMLInputElement>("entry-title");
const titleLabelEl = requireElement<HTMLSpanElement>("entry-title-label");
const titleHelpEl = requireElement<HTMLParagraphElement>("entry-title-help");
const currencyField = requireElement<HTMLSelectElement>("entry-currency");
const splitField = requireElement<HTMLInputElement>("entry-split");
const splitGroup = requireElement<HTMLElement>("split-group");
const amountGroup = requireElement<HTMLElement>("amount-group");
const currencyGroup = requireElement<HTMLElement>("currency-group");
const subjectGroup = requireElement<HTMLElement>("subject-group");
const kindHelpEl = requireElement<HTMLParagraphElement>("kind-help");
const subjectLabelEl = requireElement<HTMLSpanElement>("subject-label");
const amountInput = requireElement<HTMLInputElement>("entry-amount");
const detailsInput = requireElement<HTMLTextAreaElement>("entry-details");
const maybeField = requireElement<HTMLInputElement>("entry-is-maybe");

function requireElement<TElement>(id: string): TElement {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Missing element: ${id}`);
    }

    return element as unknown as TElement;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseApiError(value: unknown): ApiErrorResponse {
    if (isRecord(value) && typeof value.error === "string") {
        return { error: value.error };
    }

    return { error: "Request failed" };
}

function parseLedgerViewResponse(value: unknown): LedgerViewResponse {
    if (!isRecord(value)) {
        throw new Error("Invalid ledger response");
    }

    return value as unknown as LedgerViewResponse;
}

function getStatusCode(error: unknown): number | null {
    if (isRecord(error) && typeof error.statusCode === "number") {
        return error.statusCode;
    }

    return null;
}

function escapeHtml(value: string | number | null | undefined): string {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizeText(value: string, maxLength: number): string {
    return value.trim().replace(/^"|"$/g, "").slice(0, maxLength);
}

function stripMaybePrefix(details: string): string {
    const trimmed = details.trim();
    if (trimmed === MAYBE_ONLY_MESSAGE) return "";
    if (trimmed.startsWith(MAYBE_PREFIX)) {
        return trimmed.slice(MAYBE_PREFIX.length).trim();
    }

    return trimmed;
}

function withMaybePrefix(details: string, isMaybe: boolean): string {
    const stripped = stripMaybePrefix(details);
    if (!isMaybe) return stripped;
    if (!stripped) return MAYBE_ONLY_MESSAGE;
    return `${MAYBE_PREFIX}${stripped}`;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
    const safeCurrency = String(currency ?? DEFAULT_CURRENCY).toUpperCase();
    const numericAmount = Number(amount ?? 0);

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: safeCurrency,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    } catch {
        return `${safeCurrency} ${numericAmount.toFixed(2)}`;
    }
}

function formatMoneyList(
    items: Array<{ amount: number; currency: string }> | undefined,
    fallback = "—",
): string {
    if (!items || items.length === 0) return fallback;
    return items.map((item) => formatMoney(item.amount, item.currency)).join(" · ");
}

function showStatus(target: HTMLDivElement, message: string, type: StatusTone): void {
    if (!message) {
        target.hidden = true;
        target.textContent = "";
        target.className = "ledger-status-banner";
        return;
    }

    target.hidden = false;
    target.textContent = message;
    target.className = `ledger-status-banner ledger-status-banner-${type}`;
}

async function triggerExitLogout(): Promise<void> {
    if (hasTriggeredExitLogout) return;
    hasTriggeredExitLogout = true;

    try {
        await fetch(LOGOUT_ENDPOINT, {
            method: "POST",
            credentials: "same-origin",
            keepalive: true,
        });
    } catch {
        // Ignore background logout failures during navigation.
    }
}

async function readJson(response: Response): Promise<unknown> {
    return await response.json().catch(() => null);
}

async function requestJSON<TResponse>(
    url: string,
    options: RequestInit,
    parser: (value: unknown) => TResponse,
): Promise<TResponse> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });

    const payload = await readJson(response);
    if (!response.ok) {
        const error = parseApiError(payload);
        throw Object.assign(new Error(error.error), { statusCode: response.status });
    }

    return parser(payload);
}

function getPartnerLabel(email: string | null | undefined): string {
    return state.data?.partners.find((partner) => partner.email === email)?.label ?? email ?? "Partner";
}

function getOtherPartner(viewerEmail: string): Partner | undefined {
    return state.data?.partners.find((partner) => partner.email !== viewerEmail);
}

function getKindHelp(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Use this when one partner owes the other money directly.";
        case "payment":
            return "Use this when one partner paid the other partner toward an existing debt.";
        case "expense":
            return "Use this for shared business costs that one partner paid up front.";
        case "income":
            return "Use this when one partner received shared money that should be split.";
        case "note":
            return "Use a note for agreements, context, or reminders that should also be approved transparently.";
    }
}

function getTitleHelp(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Every debt should have a short title so both partners know exactly what it refers to.";
        case "payment":
            return "Name the payment clearly so it is easy to match against the debt or agreement it affects.";
        case "expense":
            return "Give the shared expense a recognizable title, like hosting, ads, or travel.";
        case "income":
            return "Use a title that says where the shared income came from.";
        case "note":
            return "Use a short title so this note stays easy to scan later.";
    }
}

function getTitlePlaceholder(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "e.g. Hosting advance owed back";
        case "payment":
            return "e.g. Partial payment for hosting debt";
        case "expense":
            return "e.g. Shared domain renewal";
        case "income":
            return "e.g. Client project deposit";
        case "note":
            return "e.g. Agreed payment plan";
    }
}

function getDetailsPlaceholder(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Explain why the debt exists, what it covers, and anything the other partner should confirm.";
        case "payment":
            return "Explain what the payment covered, whether it was partial or full, and any reference details.";
        case "expense":
            return "Describe the shared expense, what was paid for, and anything that supports the amount.";
        case "income":
            return "Describe where the income came from and how the shared split should be understood.";
        case "note":
            return "Add context, links, or reminders the other partner should approve transparently.";
    }
}

function getSubjectLabel(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Who owes this amount?";
        case "payment":
            return "Who made this payment?";
        case "expense":
            return "Who paid this shared expense?";
        case "income":
            return "Who received this shared income?";
        case "note":
            return "Partner";
    }
}

function updateFormForKind(): void {
    const kind = kindField.value as LedgerEntryKind;
    const isNote = kind === "note";
    const usesSplit = kind === "expense" || kind === "income";

    kindHelpEl.textContent = getKindHelp(kind);
    subjectLabelEl.textContent = getSubjectLabel(kind);
    titleLabelEl.textContent = kind === "debt" ? "Debt title" : "Title";
    titleHelpEl.textContent = getTitleHelp(kind);
    titleInput.placeholder = getTitlePlaceholder(kind);
    detailsInput.placeholder = getDetailsPlaceholder(kind);

    amountGroup.hidden = isNote;
    currencyGroup.hidden = isNote;
    subjectGroup.hidden = isNote;
    splitGroup.hidden = !usesSplit;

    amountInput.required = !isNote;
    subjectField.required = !isNote;
    splitField.required = usesSplit;
}

function getPartnerLabelsForSuggestion(): { subjectLabel: string; counterpartyLabel: string } {
    const subjectLabel = getPartnerLabel(subjectField.value);
    const counterpartyLabel = state.data?.partners.find((partner) => partner.email !== subjectField.value)?.label
        ?? state.data?.partners[0]?.label
        ?? "Partner";

    return {
        subjectLabel,
        counterpartyLabel,
    };
}

function buildSuggestionContext(): LedgerEntrySuggestionContext {
    const { subjectLabel, counterpartyLabel } = getPartnerLabelsForSuggestion();

    return {
        kind: kindField.value as LedgerEntryKind,
        subjectLabel,
        counterpartyLabel,
        amount: amountInput.value.trim(),
        currency: currencyField.value || DEFAULT_CURRENCY,
        splitPercent: splitField.value.trim(),
        title: titleInput.value.trim(),
        details: stripMaybePrefix(detailsInput.value),
        isMaybe: maybeField.checked,
    };
}

function buildFallbackSuggestion(context: LedgerEntrySuggestionContext): LedgerEntrySuggestion {
    const amountText = context.amount ? `${context.amount} ${context.currency}` : context.currency;
    const title = context.title || (() => {
        switch (context.kind) {
            case "debt":
                return `${context.subjectLabel} owes ${context.counterpartyLabel}`;
            case "payment":
                return `Payment from ${context.subjectLabel}`;
            case "expense":
                return `Shared expense paid by ${context.subjectLabel}`;
            case "income":
                return `Shared income received by ${context.subjectLabel}`;
            case "note":
                return `Shared note for ${context.subjectLabel}`;
        }
    })();

    const detailsBase = context.details || (() => {
        switch (context.kind) {
            case "debt":
                return `${context.subjectLabel} may owe ${context.counterpartyLabel} ${amountText}. Add what this debt is for and when it should be settled.`;
            case "payment":
                return `${context.subjectLabel} paid ${amountText} toward a shared obligation with ${context.counterpartyLabel}. Add what this payment covers.`;
            case "expense":
                return `${context.subjectLabel} paid ${amountText} for a shared expense. The other partner share is ${context.splitPercent || "50"}% unless both agree otherwise.`;
            case "income":
                return `${context.subjectLabel} received ${amountText} as shared income. The partner split is ${context.splitPercent || "50"}% unless both agree otherwise.`;
            case "note":
                return `Shared note between ${context.subjectLabel} and ${context.counterpartyLabel}. Add the context both partners should approve.`;
        }
    })();

    return {
        title: normalizeText(title, 140),
        details: withMaybePrefix(normalizeText(detailsBase, 4000), context.isMaybe),
        source: "fallback",
    };
}

function getBrowserLanguageModelFactory(): BrowserLanguageModelFactory | null {
    if (window.ai?.languageModel) return window.ai.languageModel;
    if (window.LanguageModel) return window.LanguageModel;
    return null;
}

function buildAiPrompt(context: LedgerEntrySuggestionContext): string {
    return [
        "You help write very short finance ledger entries for a two-partner approval workflow.",
        "Return JSON only with exactly two string keys: title and details.",
        "Keep the title under 70 characters.",
        "Keep the details under 220 characters.",
        "Be clear, neutral, and easy for another partner to review.",
        `Kind: ${context.kind}`,
        `Main partner: ${context.subjectLabel}`,
        `Other partner: ${context.counterpartyLabel}`,
        context.amount ? `Amount: ${context.amount}` : "",
        context.currency ? `Currency: ${context.currency}` : "",
        context.splitPercent ? `Split percent: ${context.splitPercent}` : "",
        context.title ? `Current title draft: ${context.title}` : "",
        context.details ? `Current details draft: ${context.details}` : "",
        context.isMaybe ? "This entry is tentative and should sound like a maybe / needs confirmation item." : "",
    ].filter(Boolean).join("\n");
}

function parseAiSuggestion(raw: string, isMaybe: boolean): LedgerEntrySuggestion | null {
    const trimmed = raw.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
        try {
            const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as unknown;
            if (isRecord(parsed) && typeof parsed.title === "string" && typeof parsed.details === "string") {
                return {
                    title: normalizeText(parsed.title, 140),
                    details: withMaybePrefix(normalizeText(parsed.details, 4000), isMaybe),
                    source: "ai",
                };
            }
        } catch {
            // Fall through to the line-based parser.
        }
    }

    const lines = trimmed.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const titleLine = lines.find((line) => /^title\s*:/i.test(line));
    const detailsLine = lines.find((line) => /^details\s*:/i.test(line));
    if (!titleLine || !detailsLine) return null;

    return {
        title: normalizeText(titleLine.replace(/^title\s*:/i, ""), 140),
        details: withMaybePrefix(normalizeText(detailsLine.replace(/^details\s*:/i, ""), 4000), isMaybe),
        source: "ai",
    };
}

async function suggestWithAi(context: LedgerEntrySuggestionContext): Promise<LedgerEntrySuggestion | null> {
    const factory = getBrowserLanguageModelFactory();
    if (!factory) return null;

    let session: AiPromptSession | null = null;

    try {
        session = await factory.create();
        const response = await session.prompt(buildAiPrompt(context));
        return parseAiSuggestion(response, context.isMaybe);
    } catch {
        return null;
    } finally {
        session?.destroy?.();
    }
}

async function suggestEntryCopy(): Promise<LedgerEntrySuggestion> {
    const context = buildSuggestionContext();
    const aiSuggestion = await suggestWithAi(context);
    if (aiSuggestion) return aiSuggestion;
    return buildFallbackSuggestion(context);
}

function syncMaybeDetails(): void {
    detailsInput.value = withMaybePrefix(detailsInput.value, maybeField.checked);
}

function populatePartnerOptions(): void {
    const selected = subjectField.value;
    const fallback = state.data?.viewer.email ?? "";

    subjectField.innerHTML = (state.data?.partners ?? []).map((partner) => {
        const isSelected = (selected || fallback) === partner.email;
        return `<option value="${escapeHtml(partner.email)}"${isSelected ? " selected" : ""}>${escapeHtml(partner.label)} (${escapeHtml(partner.email)})</option>`;
    }).join("");
}

function renderRules(): void {
    rulesListEl.innerHTML = (state.data?.rules ?? []).map((rule) => `<li>${escapeHtml(rule)}</li>`).join("");
}

function renderSummary(): void {
    const summary = state.data?.summary;
    const viewer = state.data?.viewer;
    if (!summary || !viewer) {
        summaryGridEl.innerHTML = "";
        return;
    }

    const viewerBalance = summary.partnerBalances.find((partner) => partner.email === viewer.email);
    const settlementText = summary.settlements.length > 0
        ? summary.settlements
            .map((item) => `${escapeHtml(item.fromLabel)} owes ${escapeHtml(item.toLabel)} ${escapeHtml(formatMoney(item.amount, item.currency))}`)
            .join("<br />")
        : "Ledger is balanced right now";
    const integrityText = summary.integrity.ok
        ? `Audit chain clean · ${summary.integrity.events} events`
        : summary.integrity.reason;

    summaryGridEl.innerHTML = `
    <article class="ledger-stat-card">
      <span class="ledger-stat-label">Pending approvals</span>
      <strong class="ledger-stat-value">${escapeHtml(summary.pendingCount)}</strong>
      <span class="ledger-stat-meta">Nothing affects totals until the other partner approves.</span>
    </article>
    <article class="ledger-stat-card">
      <span class="ledger-stat-label">Approved entries</span>
      <strong class="ledger-stat-value">${escapeHtml(summary.approvedCount)}</strong>
      <span class="ledger-stat-meta">Rejected entries: ${escapeHtml(summary.rejectedCount)}</span>
    </article>
    <article class="ledger-stat-card ledger-stat-card-wide">
      <span class="ledger-stat-label">Suggested settlement</span>
      <strong class="ledger-stat-value ledger-stat-value-small">${settlementText}</strong>
      <span class="ledger-stat-meta">This rolls debt, payments, shared expenses, and shared income together.</span>
    </article>
    <article class="ledger-stat-card">
      <span class="ledger-stat-label">Your current position</span>
      <strong class="ledger-stat-value ledger-stat-value-small">${escapeHtml(formatMoneyList(viewerBalance?.amounts, "You are square right now"))}</strong>
      <span class="ledger-stat-meta">Positive amounts mean your side currently owes the other partner.</span>
    </article>
    <article class="ledger-stat-card ledger-stat-card-wide ${summary.integrity.ok ? "" : "ledger-stat-card-warning"}">
      <span class="ledger-stat-label">Integrity</span>
      <strong class="ledger-stat-value ledger-stat-value-small">${escapeHtml(integrityText)}</strong>
      <span class="ledger-stat-meta">The books are encrypted at rest and every action is added to a tamper-evident audit chain.</span>
    </article>
  `;
}

function renderReviewActions(entry: LedgerEntryView): string {
    if (!entry.canReview) return "";

    return `
    <div class="ledger-review-box">
      <label class="ledger-mini-label" for="review-note-${escapeHtml(entry.id)}">Review note</label>
      <textarea id="review-note-${escapeHtml(entry.id)}" class="ledger-review-note" rows="2" placeholder="Optional: explain why you approve or reject this"></textarea>
      <div class="ledger-entry-actions">
        <button type="button" class="btn-primary ledger-action-btn" data-action="approved" data-entry-id="${escapeHtml(entry.id)}">Approve</button>
        <button type="button" class="btn-outline ledger-action-btn" data-action="rejected" data-entry-id="${escapeHtml(entry.id)}">Reject</button>
      </div>
    </div>
  `;
}

function renderEntryCard(entry: LedgerEntryView): string {
    const amountMarkup = entry.amount !== null
        ? `<div class="ledger-entry-amount">${escapeHtml(formatMoney(entry.amount, entry.currency))}</div>`
        : "";

    const reviewMarkup = entry.review
        ? `
      <div class="ledger-entry-review">
        <strong>${escapeHtml(entry.review.action === "approved" ? "Approved" : "Rejected")}</strong>
        by ${escapeHtml(entry.reviewerLabel ?? entry.review.by.email)}
        on ${escapeHtml(formatDate(entry.review.at))}
        ${entry.review.note ? `<div class="ledger-entry-note">${escapeHtml(entry.review.note)}</div>` : ""}
      </div>
    `
        : "";

    const splitMarkup = entry.splitPercent !== null
        ? `<span class="ledger-pill">Split ${escapeHtml(entry.splitPercent)}%</span>`
        : "";
    const maybeMarkup = entry.isMaybe
        ? '<span class="ledger-pill ledger-pill-maybe">maybe</span>'
        : "";

    return `
    <article class="ledger-entry ledger-entry-${escapeHtml(entry.status)}">
      <div class="ledger-entry-top">
        <div>
          <div class="ledger-entry-badges">
            <span class="ledger-pill ledger-pill-kind">${escapeHtml(entry.kind)}</span>
            <span class="ledger-pill ledger-pill-status ledger-pill-status-${escapeHtml(entry.status)}">${escapeHtml(entry.status)}</span>
            ${splitMarkup}
                        ${maybeMarkup}
          </div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p class="ledger-entry-subtitle">${escapeHtml(entry.descriptionLine)}</p>
        </div>
        ${amountMarkup}
      </div>

      ${entry.details ? `<p class="ledger-entry-body">${escapeHtml(entry.details)}</p>` : ""}

      <dl class="ledger-entry-meta">
        <div>
          <dt>Created by</dt>
          <dd>${escapeHtml(entry.createdByLabel)} · ${escapeHtml(formatDate(entry.createdAt))}</dd>
        </div>
        ${entry.subjectLabel ? `<div><dt>Main partner</dt><dd>${escapeHtml(entry.subjectLabel)}</dd></div>` : ""}
        ${entry.counterpartyLabel ? `<div><dt>Other partner</dt><dd>${escapeHtml(entry.counterpartyLabel)}</dd></div>` : ""}
      </dl>

      ${reviewMarkup}
      ${renderReviewActions(entry)}
    </article>
  `;
}

function renderPendingAndEntries(): void {
    const entries = state.data?.entries ?? [];
    const pending = entries.filter((entry) => entry.status === "pending");

    pendingListEl.innerHTML = pending.length > 0
        ? pending.map((entry) => renderEntryCard(entry)).join("")
        : '<div class="ledger-empty">No pending approvals. The books are calm for the moment.</div>';

    entryListEl.innerHTML = entries.length > 0
        ? entries.map((entry) => renderEntryCard(entry)).join("")
        : '<div class="ledger-empty">No finance entries yet. Add the first one to start the shared record.</div>';
}

function renderPage(): void {
    const viewer = state.data?.viewer;
    if (!viewer) return;

    const otherPartner = getOtherPartner(viewer.email);

    userNameEl.textContent = viewer.name;
    greetingTextEl.textContent = `Welcome back, ${viewer.name}`;
    introTextEl.textContent = `This is the shared finance room for ${getPartnerLabel(viewer.email)} and ${getPartnerLabel(otherPartner?.email)}. Every change is transparent, reviewable, and tied to a signed-in partner.`;

    populatePartnerOptions();
    renderRules();
    renderSummary();
    renderPendingAndEntries();
    updateFormForKind();
}

async function loadLedger(): Promise<void> {
    state.data = await requestJSON("/api/private-ledger", { method: "GET" }, parseLedgerViewResponse);
    renderPage();
}

function buildLedgerEntryInput(formData: FormData): LedgerEntryInput {
    const kind = String(formData.get("kind") ?? "note") as LedgerEntryKind;
    const isMaybe = formData.get("isMaybe") !== null;
    const payload: LedgerEntryInput = {
        kind,
        title: String(formData.get("title") ?? ""),
        details: withMaybePrefix(String(formData.get("details") ?? ""), isMaybe),
        isMaybe,
    };

    if (kind !== "note") {
        payload.subjectEmail = String(formData.get("subjectEmail") ?? "");
        payload.amount = String(formData.get("amount") ?? "");
        payload.currency = String(formData.get("currency") ?? DEFAULT_CURRENCY);
    }

    if (kind === "expense" || kind === "income") {
        payload.splitPercent = String(formData.get("splitPercent") ?? "50");
    }

    return payload;
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    showStatus(formStatusEl, "", "info");

    const formData = new FormData(ledgerForm);
    const payload = buildLedgerEntryInput(formData);

    try {
        submitButton.disabled = true;
        state.data = await requestJSON(
            "/api/private-ledger/entries",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            parseLedgerViewResponse,
        );

        showStatus(
            formStatusEl,
            "Entry submitted. It will stay pending until the other partner reviews it.",
            "success",
        );
        ledgerForm.reset();
        currencyField.value = DEFAULT_CURRENCY;
        splitField.value = "50";
        maybeField.checked = false;
        renderPage();
    } catch (error) {
        if (getStatusCode(error) === 401) {
            window.location.href = "/login.html";
            return;
        }

        showStatus(formStatusEl, error instanceof Error ? error.message : String(error), "error");
    } finally {
        submitButton.disabled = false;
    }
}

async function handleAiSuggestion(): Promise<void> {
    showStatus(formStatusEl, "Working on a draft…", "info");

    try {
        aiButton.disabled = true;
        const suggestion = await suggestEntryCopy();
        titleInput.value = suggestion.title;
        detailsInput.value = suggestion.details;

        showStatus(
            formStatusEl,
            suggestion.source === "ai"
                ? "Filled the title and description with AI help."
                : "Browser AI was not available, so I filled a smart draft instead.",
            suggestion.source === "ai" ? "success" : "warning",
        );
    } catch (error) {
        showStatus(formStatusEl, error instanceof Error ? error.message : String(error), "error");
    } finally {
        aiButton.disabled = false;
    }
}

function findReviewNote(button: HTMLButtonElement): string {
    const card = button.closest(".ledger-entry");
    if (!(card instanceof HTMLElement)) return "";

    const noteField = card.querySelector<HTMLTextAreaElement>(".ledger-review-note");
    return noteField?.value ?? "";
}

async function handleReview(button: HTMLButtonElement): Promise<void> {
    const entryId = button.dataset.entryId ?? "";
    const action = (button.dataset.action ?? "approved") as LedgerReviewAction;
    const payload: LedgerReviewInput = {
        entryId,
        action,
        note: findReviewNote(button),
    };

    try {
        button.disabled = true;
        showStatus(pageStatusEl, "Saving review…", "info");
        state.data = await requestJSON(
            "/api/private-ledger/review",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
            parseLedgerViewResponse,
        );
        renderPage();
        showStatus(
            pageStatusEl,
            action === "approved"
                ? "Entry approved and added to the live books."
                : "Entry rejected. The audit trail keeps the decision visible.",
            action === "approved" ? "success" : "warning",
        );
    } catch (error) {
        if (getStatusCode(error) === 401) {
            window.location.href = "/login.html";
            return;
        }

        showStatus(pageStatusEl, error instanceof Error ? error.message : String(error), "error");
    } finally {
        button.disabled = false;
    }
}

backButton.addEventListener("click", (event) => {
    event.preventDefault();

    void (async () => {
        await triggerExitLogout();

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = "/";
    })();
});

window.addEventListener("pagehide", () => {
    void triggerExitLogout();
});

kindField.addEventListener("change", updateFormForKind);
maybeField.addEventListener("change", syncMaybeDetails);
aiButton.addEventListener("click", () => {
    void handleAiSuggestion();
});
ledgerForm.addEventListener("submit", (event) => {
    void handleSubmit(event);
});

document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest<HTMLButtonElement>(".ledger-action-btn");
    if (!button) return;

    void handleReview(button);
});

void (async () => {
    try {
        await loadLedger();
    } catch (error) {
        if (getStatusCode(error) === 401) {
            window.location.href = "/login.html";
            return;
        }

        showStatus(pageStatusEl, error instanceof Error ? error.message : String(error), "error");
    }
})();
