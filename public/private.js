const DEFAULT_CURRENCY = "USD";
const state = {
    data: null,
};
const backButton = requireElement("back-btn");
const userNameEl = requireElement("user-name");
const greetingTextEl = requireElement("greeting-text");
const introTextEl = requireElement("greeting-intro");
const summaryGridEl = requireElement("summary-grid");
const rulesListEl = requireElement("rules-list");
const pendingListEl = requireElement("pending-list");
const entryListEl = requireElement("entry-list");
const ledgerForm = requireElement("ledger-form");
const submitButton = requireElement("ledger-submit-btn");
const formStatusEl = requireElement("form-status");
const pageStatusEl = requireElement("page-status");
const kindField = requireElement("entry-kind");
const subjectField = requireElement("entry-subject");
const currencyField = requireElement("entry-currency");
const splitField = requireElement("entry-split");
const splitGroup = requireElement("split-group");
const amountGroup = requireElement("amount-group");
const currencyGroup = requireElement("currency-group");
const subjectGroup = requireElement("subject-group");
const kindHelpEl = requireElement("kind-help");
const subjectLabelEl = requireElement("subject-label");
const amountInput = requireElement("entry-amount");
function requireElement(id) {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
        throw new Error(`Missing element: ${id}`);
    }
    return element;
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function parseApiError(value) {
    if (isRecord(value) && typeof value.error === "string") {
        return { error: value.error };
    }
    return { error: "Request failed" };
}
function parseLedgerViewResponse(value) {
    if (!isRecord(value)) {
        throw new Error("Invalid ledger response");
    }
    return value;
}
function getStatusCode(error) {
    if (isRecord(error) && typeof error.statusCode === "number") {
        return error.statusCode;
    }
    return null;
}
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
function formatDate(value) {
    if (!value)
        return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "—";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
function formatMoney(amount, currency) {
    const safeCurrency = String(currency ?? DEFAULT_CURRENCY).toUpperCase();
    const numericAmount = Number(amount ?? 0);
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: safeCurrency,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    }
    catch {
        return `${safeCurrency} ${numericAmount.toFixed(2)}`;
    }
}
function formatMoneyList(items, fallback = "—") {
    if (!items || items.length === 0)
        return fallback;
    return items.map((item) => formatMoney(item.amount, item.currency)).join(" · ");
}
function showStatus(target, message, type) {
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
async function readJson(response) {
    return await response.json().catch(() => null);
}
async function requestJSON(url, options, parser) {
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
function getPartnerLabel(email) {
    return state.data?.partners.find((partner) => partner.email === email)?.label ?? email ?? "Partner";
}
function getOtherPartner(viewerEmail) {
    return state.data?.partners.find((partner) => partner.email !== viewerEmail);
}
function getKindHelp(kind) {
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
function getSubjectLabel(kind) {
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
function updateFormForKind() {
    const kind = kindField.value;
    const isNote = kind === "note";
    const usesSplit = kind === "expense" || kind === "income";
    kindHelpEl.textContent = getKindHelp(kind);
    subjectLabelEl.textContent = getSubjectLabel(kind);
    amountGroup.hidden = isNote;
    currencyGroup.hidden = isNote;
    subjectGroup.hidden = isNote;
    splitGroup.hidden = !usesSplit;
    amountInput.required = !isNote;
    subjectField.required = !isNote;
    splitField.required = usesSplit;
}
function populatePartnerOptions() {
    const selected = subjectField.value;
    const fallback = state.data?.viewer.email ?? "";
    subjectField.innerHTML = (state.data?.partners ?? []).map((partner) => {
        const isSelected = (selected || fallback) === partner.email;
        return `<option value="${escapeHtml(partner.email)}"${isSelected ? " selected" : ""}>${escapeHtml(partner.label)} (${escapeHtml(partner.email)})</option>`;
    }).join("");
}
function renderRules() {
    rulesListEl.innerHTML = (state.data?.rules ?? []).map((rule) => `<li>${escapeHtml(rule)}</li>`).join("");
}
function renderSummary() {
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
function renderReviewActions(entry) {
    if (!entry.canReview)
        return "";
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
function renderEntryCard(entry) {
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
    return `
    <article class="ledger-entry ledger-entry-${escapeHtml(entry.status)}">
      <div class="ledger-entry-top">
        <div>
          <div class="ledger-entry-badges">
            <span class="ledger-pill ledger-pill-kind">${escapeHtml(entry.kind)}</span>
            <span class="ledger-pill ledger-pill-status ledger-pill-status-${escapeHtml(entry.status)}">${escapeHtml(entry.status)}</span>
            ${splitMarkup}
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
function renderPendingAndEntries() {
    const entries = state.data?.entries ?? [];
    const pending = entries.filter((entry) => entry.status === "pending");
    pendingListEl.innerHTML = pending.length > 0
        ? pending.map((entry) => renderEntryCard(entry)).join("")
        : '<div class="ledger-empty">No pending approvals. The books are calm for the moment.</div>';
    entryListEl.innerHTML = entries.length > 0
        ? entries.map((entry) => renderEntryCard(entry)).join("")
        : '<div class="ledger-empty">No finance entries yet. Add the first one to start the shared record.</div>';
}
function renderPage() {
    const viewer = state.data?.viewer;
    if (!viewer)
        return;
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
async function loadLedger() {
    state.data = await requestJSON("/api/private-ledger", { method: "GET" }, parseLedgerViewResponse);
    renderPage();
}
function buildLedgerEntryInput(formData) {
    const kind = String(formData.get("kind") ?? "note");
    const payload = {
        kind,
        title: String(formData.get("title") ?? ""),
        details: String(formData.get("details") ?? ""),
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
async function handleSubmit(event) {
    event.preventDefault();
    showStatus(formStatusEl, "", "info");
    const formData = new FormData(ledgerForm);
    const payload = buildLedgerEntryInput(formData);
    try {
        submitButton.disabled = true;
        state.data = await requestJSON("/api/private-ledger/entries", {
            method: "POST",
            body: JSON.stringify(payload),
        }, parseLedgerViewResponse);
        showStatus(formStatusEl, "Entry submitted. It will stay pending until the other partner reviews it.", "success");
        ledgerForm.reset();
        currencyField.value = DEFAULT_CURRENCY;
        splitField.value = "50";
        renderPage();
    }
    catch (error) {
        if (getStatusCode(error) === 401) {
            window.location.href = "/login.html";
            return;
        }
        showStatus(formStatusEl, error instanceof Error ? error.message : String(error), "error");
    }
    finally {
        submitButton.disabled = false;
    }
}
function findReviewNote(button) {
    const card = button.closest(".ledger-entry");
    if (!(card instanceof HTMLElement))
        return "";
    const noteField = card.querySelector(".ledger-review-note");
    return noteField?.value ?? "";
}
async function handleReview(button) {
    const entryId = button.dataset.entryId ?? "";
    const action = (button.dataset.action ?? "approved");
    const payload = {
        entryId,
        action,
        note: findReviewNote(button),
    };
    try {
        button.disabled = true;
        showStatus(pageStatusEl, "Saving review…", "info");
        state.data = await requestJSON("/api/private-ledger/review", {
            method: "POST",
            body: JSON.stringify(payload),
        }, parseLedgerViewResponse);
        renderPage();
        showStatus(pageStatusEl, action === "approved"
            ? "Entry approved and added to the live books."
            : "Entry rejected. The audit trail keeps the decision visible.", action === "approved" ? "success" : "warning");
    }
    catch (error) {
        if (getStatusCode(error) === 401) {
            window.location.href = "/login.html";
            return;
        }
        showStatus(pageStatusEl, error instanceof Error ? error.message : String(error), "error");
    }
    finally {
        button.disabled = false;
    }
}
backButton.addEventListener("click", (event) => {
    if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
    }
});
kindField.addEventListener("change", updateFormForKind);
ledgerForm.addEventListener("submit", (event) => {
    void handleSubmit(event);
});
document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element))
        return;
    const button = target.closest(".ledger-action-btn");
    if (!button)
        return;
    void handleReview(button);
});
void (async () => {
    try {
        await loadLedger();
    }
    catch (error) {
        if (getStatusCode(error) === 401) {
            window.location.href = "/login.html";
            return;
        }
        showStatus(pageStatusEl, error instanceof Error ? error.message : String(error), "error");
    }
})();
export {};
