import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { FormEvent, ReactNode } from "react";
import type { ApiErrorResponse } from "../shared/auth.ts";
import { disableWaelioRuntimeCaching } from "../shared/browser-runtime.ts";
import { useThemeMode } from "../shared/theme.ts";
import type {
    LedgerEntryInput,
    LedgerEntryKind,
    LedgerEntryView,
    LedgerReviewAction,
    LedgerReviewInput,
    LedgerViewResponse,
    Partner,
} from "../shared/private-ledger.ts";
import "./styles.css";

type StatusTone = "info" | "success" | "warning" | "error";

type WorkbookValue = number | string;

interface StatusMessage {
    tone: StatusTone;
    text: string;
}

interface FormState {
    kind: LedgerEntryKind;
    subjectEmail: string;
    title: string;
    amount: string;
    currency: string;
    splitPercent: string;
    details: string;
    isMaybe: boolean;
}

interface LedgerColumn {
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    cell: (entry: LedgerEntryView) => ReactNode;
}

interface WorkbookSheet {
    name: string;
    columns: string[];
    rows: WorkbookValue[][];
}

const DEFAULT_CURRENCY = "USD";
const MAYBE_PREFIX = "Maybe / needs confirmation: ";
const MAYBE_ONLY_MESSAGE = "Maybe / needs confirmation.";
const LOGOUT_ENDPOINT = "/api/logout";
const PRIVATE_HOME = "/private";
const LOGIN_PAGE = "/login.html";

let hasTriggeredExitLogout = false;

function resetForm(subjectEmail = ""): FormState {
    return {
        kind: "expense",
        subjectEmail,
        title: "",
        amount: "",
        currency: DEFAULT_CURRENCY,
        splitPercent: "50",
        details: "",
        isMaybe: false,
    };
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

function getErrorMessage(response: Response, payload: unknown, rawText: string): string {
    const parsedError = parseApiError(payload).error.trim();
    if (parsedError && parsedError !== "Request failed") {
        return parsedError;
    }

    const trimmedText = rawText.trim();
    if (trimmedText) {
        if (trimmedText.startsWith("<!doctype html") || trimmedText.startsWith("<html")) {
            return `HTTP ${response.status} ${response.statusText || "Request failed"}`;
        }

        return trimmedText.slice(0, 280);
    }

    return `HTTP ${response.status} ${response.statusText || "Request failed"}`;
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
    if (amount === null || amount === undefined || currency === null || currency === undefined) {
        return "—";
    }

    const safeCurrency = String(currency || DEFAULT_CURRENCY).toUpperCase();
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

function getKindLabel(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Direct liability";
        case "payment":
            return "Settlement payment";
        case "expense":
            return "Shared expense";
        case "income":
            return "Shared income";
        case "note":
            return "Memo / note";
    }
}

function getKindHelp(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Use for one partner owing the other directly.";
        case "payment":
            return "Use for a payment that settles a direct liability.";
        case "expense":
            return "Use for business costs paid up front by one partner.";
        case "income":
            return "Use for website or business income that must be shared.";
        case "note":
            return "Use for non-posting notes, explanations, or supporting business context.";
    }
}

function getTitleHelp(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Use a concise liability title that reads clearly in a register and export.";
        case "payment":
            return "Use a title that ties the payment to the liability or settlement it affects.";
        case "expense":
            return "Use the actual expense title, such as hosting, ads, domain renewal, or contractor work.";
        case "income":
            return "Use the business source of income, such as client payment, ad revenue, or sponsorship.";
        case "note":
            return "Use a short memo title so the note can be located quickly in the workbook.";
    }
}

function getTitlePlaceholder(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "e.g. Hosting reimbursement balance";
        case "payment":
            return "e.g. Settlement of hosting reimbursement";
        case "expense":
            return "e.g. Domain renewal for waelio.com";
        case "income":
            return "e.g. Client payment for website work";
        case "note":
            return "e.g. Payment terms agreed";
    }
}

function getDetailsPlaceholder(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Record what created the liability, any supporting context, and what still needs confirmation.";
        case "payment":
            return "Record what the payment settled, whether it was partial or full, and any reference number.";
        case "expense":
            return "Record what was purchased, the business purpose, and any invoice or receipt reference.";
        case "income":
            return "Record the income source, why it belongs to the business, and how it should be allocated.";
        case "note":
            return "Record the memo, explanation, or supporting business note for the register.";
    }
}

function getSubjectLabel(kind: LedgerEntryKind): string {
    switch (kind) {
        case "debt":
            return "Partner carrying the liability";
        case "payment":
            return "Partner making the payment";
        case "expense":
            return "Partner who paid the expense";
        case "income":
            return "Partner who received the income";
        case "note":
            return "Primary partner";
    }
}

function getTitleLabel(kind: LedgerEntryKind): string {
    return kind === "debt" ? "Liability title" : "Entry title";
}

function getSplitLabel(kind: LedgerEntryKind): string {
    return kind === "income" ? "Partner share % owed out" : "Partner share % owed back";
}

function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => null);
}

async function requestJson<TResponse>(
    url: string,
    options: RequestInit,
    parser: (value: unknown) => TResponse,
): Promise<TResponse> {
    const response = await fetch(url, {
        credentials: "same-origin",
        cache: "no-store",
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers ?? {}),
        },
    });

    const rawText = await response.text().catch(() => "");
    let payload: unknown = null;

    if (rawText) {
        try {
            payload = JSON.parse(rawText) as unknown;
        } catch {
            payload = null;
        }
    }

    if (!response.ok) {
        throw Object.assign(new Error(getErrorMessage(response, payload, rawText)), { statusCode: response.status });
    }

    return parser(payload);
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

function getPartnerLabel(partners: Partner[] | undefined, email: string | null | undefined): string {
    return partners?.find((partner) => partner.email === email)?.label ?? email ?? "Partner";
}

function getOtherPartner(partners: Partner[], viewerEmail: string): Partner | null {
    return partners.find((partner) => partner.email !== viewerEmail) ?? null;
}

function getEntryAmount(entry: LedgerEntryView): string {
    return entry.amount === null ? "—" : formatMoney(entry.amount, entry.currency);
}

function getReviewSummary(entry: LedgerEntryView): string {
    if (!entry.review) return "—";

    const actionLabel = entry.review.action === "approved" ? "Approved" : "Rejected";
    const reviewer = entry.reviewerLabel ?? entry.review.by.email;
    const note = entry.review.note ? ` · ${entry.review.note}` : "";
    return `${actionLabel} by ${reviewer} on ${formatDate(entry.review.at)}${note}`;
}

function getParticipantEffect(entry: LedgerEntryView, email: string): number | null {
    if (entry.kind === "note" || entry.amount === null || entry.currency === null) {
        return null;
    }

    if (!entry.subjectEmail || !entry.counterpartyEmail) return null;

    switch (entry.kind) {
        case "debt":
            if (entry.subjectEmail === email) return entry.amount;
            if (entry.counterpartyEmail === email) return -entry.amount;
            return null;
        case "payment":
            if (entry.subjectEmail === email) return -entry.amount;
            if (entry.counterpartyEmail === email) return entry.amount;
            return null;
        case "expense": {
            const share = entry.amount * ((entry.splitPercent ?? 50) / 100);
            if (entry.counterpartyEmail === email) return share;
            if (entry.subjectEmail === email) return -share;
            return null;
        }
        case "income": {
            const share = entry.amount * ((entry.splitPercent ?? 50) / 100);
            if (entry.subjectEmail === email) return share;
            if (entry.counterpartyEmail === email) return -share;
            return null;
        }
    }
}

function getWebsiteEffect(entry: LedgerEntryView): number | null {
    if (entry.amount === null || entry.currency === null) return null;
    if (entry.kind === "income") return entry.amount;
    if (entry.kind === "expense") return -entry.amount;
    return null;
}

function formatSelfEffect(effect: number | null, currency: string | null): string {
    if (effect === null || currency === null) return "—";
    if (Math.abs(effect) < 0.01) return "Settled";
    return effect > 0
        ? `You owe ${formatMoney(effect, currency)}`
        : `You are owed ${formatMoney(Math.abs(effect), currency)}`;
}

function formatPartnerEffect(effect: number | null, currency: string | null, partnerLabel: string): string {
    if (effect === null || currency === null) return "—";
    if (Math.abs(effect) < 0.01) return "Settled";
    return effect > 0
        ? `${partnerLabel} owes ${formatMoney(effect, currency)}`
        : `${partnerLabel} is owed ${formatMoney(Math.abs(effect), currency)}`;
}

function formatWebsiteEffect(effect: number | null, currency: string | null): string {
    if (effect === null || currency === null) return "—";
    if (Math.abs(effect) < 0.01) return "Neutral";
    return effect > 0
        ? `Revenue ${formatMoney(effect, currency)}`
        : `Expense ${formatMoney(Math.abs(effect), currency)}`;
}

function getEffectClass(effect: number | null): string {
    if (effect === null || Math.abs(effect) < 0.01) return "effect-neutral";
    return effect > 0 ? "effect-positive" : "effect-negative";
}

function downloadBlob(filename: string, mimeType: string, content: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function sanitizeWorksheetName(name: string): string {
    return name.replace(/[\\/:?*\[\]]/g, " ").slice(0, 31) || "Sheet";
}

function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function workbookCell(value: WorkbookValue, header = false): string {
    const isNumber = typeof value === "number" && Number.isFinite(value);
    const type = isNumber ? "Number" : "String";
    const style = header ? ' ss:StyleID="Header"' : isNumber ? ' ss:StyleID="Numeric"' : "";
    return `<Cell${style}><Data ss:Type="${type}">${escapeXml(String(value))}</Data></Cell>`;
}

function workbookRow(values: WorkbookValue[], header = false): string {
    return `<Row>${values.map((value) => workbookCell(value, header)).join("")}</Row>`;
}

function buildWorkbookXml(sheets: WorkbookSheet[]): string {
    const worksheets = sheets.map((sheet) => `
<Worksheet ss:Name="${escapeXml(sanitizeWorksheetName(sheet.name))}">
  <Table>
    ${workbookRow(sheet.columns, true)}
    ${sheet.rows.map((row) => workbookRow(row)).join("\n    ")}
  </Table>
</Worksheet>`).join("\n");

    return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
 xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Top" />
      <Font ss:FontName="Segoe UI" ss:Size="10" />
      <Interior />
      <NumberFormat />
      <Protection />
    </Style>
    <Style ss:ID="Header">
      <Font ss:Bold="1" />
      <Interior ss:Color="#DCE7F7" ss:Pattern="Solid" />
    </Style>
    <Style ss:ID="Numeric">
      <NumberFormat ss:Format="Standard" />
    </Style>
  </Styles>
  ${worksheets}
</Workbook>`;
}

function buildWorkbookSheets(view: LedgerViewResponse): WorkbookSheet[] {
    const entries = view.entries;
    const pending = entries.filter((entry) => entry.status === "pending");
    const viewerLabel = getPartnerLabel(view.partners, view.viewer.email);
    const otherPartner = getOtherPartner(view.partners, view.viewer.email);
    const otherPartnerLabel = otherPartner?.label ?? "Partner";
    const viewerBalance = view.summary.partnerBalances.find((partner) => partner.email === view.viewer.email);
    const partnerBalance = otherPartner
        ? view.summary.partnerBalances.find((partner) => partner.email === otherPartner.email)
        : null;

    const makeSharedRow = (entry: LedgerEntryView): WorkbookValue[] => [
        formatDate(entry.createdAt),
        entry.status,
        getKindLabel(entry.kind),
        entry.title,
        entry.subjectLabel ?? "—",
        entry.counterpartyLabel ?? "—",
        getEntryAmount(entry),
        entry.splitPercent ?? "—",
        entry.isMaybe ? "Yes" : "No",
        entry.details || "—",
        getReviewSummary(entry),
    ];

    const makeParticipantRow = (
        entry: LedgerEntryView,
        email: string,
        label: string,
        self = false,
    ): WorkbookValue[] => {
        const effect = getParticipantEffect(entry, email);
        return [
            formatDate(entry.createdAt),
            entry.status,
            getKindLabel(entry.kind),
            entry.title,
            entry.subjectLabel ?? "—",
            entry.counterpartyLabel ?? "—",
            getEntryAmount(entry),
            self ? formatSelfEffect(effect, entry.currency) : formatPartnerEffect(effect, entry.currency, label),
            entry.details || "—",
            getReviewSummary(entry),
        ];
    };

    const makeWebsiteRow = (entry: LedgerEntryView): WorkbookValue[] => [
        formatDate(entry.createdAt),
        entry.status,
        getKindLabel(entry.kind),
        entry.title,
        entry.subjectLabel ?? "—",
        getEntryAmount(entry),
        formatWebsiteEffect(getWebsiteEffect(entry), entry.currency),
        entry.splitPercent ?? "—",
        entry.details || "—",
        getReviewSummary(entry),
    ];

    return [
        {
            name: "Overview",
            columns: ["Metric", "Value", "Notes"],
            rows: [
                ["Viewer", view.viewer.name, view.viewer.email],
                ["Pending journal rows", view.summary.pendingCount, "Awaiting counterparty approval"],
                ["Approved journal rows", view.summary.approvedCount, "Posted to balances and settlement"],
                ["Rejected journal rows", view.summary.rejectedCount, "Kept in the audit history"],
                ["My current balance", formatMoneyList(viewerBalance?.amounts, "Settled"), viewerLabel],
                ["Partner current balance", formatMoneyList(partnerBalance?.amounts, "Settled"), otherPartnerLabel],
                [
                    "Suggested settlement",
                    view.summary.settlements.length > 0
                        ? view.summary.settlements
                            .map((item) => `${item.fromLabel} owes ${item.toLabel} ${formatMoney(item.amount, item.currency)}`)
                            .join(" | ")
                        : "No settlement due",
                    "Computed from approved liabilities, payments, income, and expenses",
                ],
                [
                    "Audit chain",
                    view.summary.integrity.ok ? `Clean (${view.summary.integrity.events} events)` : view.summary.integrity.reason,
                    "Encrypted at rest and written to a tamper-evident audit trail",
                ],
            ],
        },
        {
            name: "Pending Approvals",
            columns: [
                "Date",
                "Status",
                "Classification",
                "Title",
                "Primary Partner",
                "Counterparty",
                "Amount",
                "Provisional",
                "Details",
                "Review",
            ],
            rows: pending.map((entry) => [
                formatDate(entry.createdAt),
                entry.status,
                getKindLabel(entry.kind),
                entry.title,
                entry.subjectLabel ?? "—",
                entry.counterpartyLabel ?? "—",
                getEntryAmount(entry),
                entry.isMaybe ? "Yes" : "No",
                entry.details || "—",
                entry.canReview ? "Action required" : "Waiting for counterparty",
            ]),
        },
        {
            name: `${viewerLabel} Ledger`,
            columns: [
                "Date",
                "Status",
                "Classification",
                "Title",
                "Primary Partner",
                "Counterparty",
                "Amount",
                "Effect on Me",
                "Details",
                "Review",
            ],
            rows: entries.map((entry) => makeParticipantRow(entry, view.viewer.email, viewerLabel, true)),
        },
        {
            name: `${otherPartnerLabel} Ledger`,
            columns: [
                "Date",
                "Status",
                "Classification",
                "Title",
                "Primary Partner",
                "Counterparty",
                "Amount",
                `Effect on ${otherPartnerLabel}`,
                "Details",
                "Review",
            ],
            rows: entries.map((entry) => makeParticipantRow(entry, otherPartner?.email ?? "", otherPartnerLabel, false)),
        },
        {
            name: "Website Operations",
            columns: [
                "Date",
                "Status",
                "Classification",
                "Title",
                "Recorded By",
                "Amount",
                "Website Effect",
                "Split %",
                "Details",
                "Review",
            ],
            rows: entries
                .filter((entry) => entry.kind === "expense" || entry.kind === "income")
                .map((entry) => makeWebsiteRow(entry)),
        },
        {
            name: "Shared Register",
            columns: [
                "Date",
                "Status",
                "Classification",
                "Title",
                "Primary Partner",
                "Counterparty",
                "Amount",
                "Split %",
                "Provisional",
                "Details",
                "Review",
            ],
            rows: entries.map((entry) => makeSharedRow(entry)),
        },
    ];
}

function exportWorkbook(view: LedgerViewResponse): void {
    const workbook = buildWorkbookXml(buildWorkbookSheets(view));
    downloadBlob("waelio-ledger-workbook.xls", "application/vnd.ms-excel", workbook);
}

function StatusBanner({ status }: { status: StatusMessage | null }): ReactNode {
    if (!status) return null;

    return <div className={`workbook-status workbook-status-${status.tone}`}>{status.text}</div>;
}

function StatusPill({ status }: { status: LedgerEntryView["status"] }): ReactNode {
    return <span className={`sheet-pill sheet-pill-${status}`}>{status}</span>;
}

function ProvisionalPill({ provisional }: { provisional: boolean }): ReactNode {
    return provisional
        ? <span className="sheet-pill sheet-pill-provisional">Provisional</span>
        : <span className="workbook-secondary">No</span>;
}

function SheetPanel(
    props: { title: string; subtitle: string; actions?: ReactNode; children: ReactNode },
): ReactNode {
    return (
        <section className="sheet-panel">
            <div className="sheet-panel-header">
                <div>
                    <h2>{props.title}</h2>
                    <p>{props.subtitle}</p>
                </div>
                {props.actions}
            </div>
            <div className="sheet-panel-body">{props.children}</div>
        </section>
    );
}

function LedgerTable(
    props: { columns: LedgerColumn[]; entries: LedgerEntryView[]; emptyMessage: string },
): ReactNode {
    if (props.entries.length === 0) {
        return <div className="sheet-empty">{props.emptyMessage}</div>;
    }

    return (
        <div className="sheet-scroll">
            <table className="workbook-table">
                <thead>
                    <tr>
                        {props.columns.map((column) => (
                            <th key={column.key} className={column.align ? `align-${column.align}` : undefined}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {props.entries.map((entry) => (
                        <tr key={entry.id}>
                            {props.columns.map((column) => (
                                <td key={column.key} className={column.align ? `align-${column.align}` : undefined}>
                                    {column.cell(entry)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SummaryCards(props: { rows: Array<{ label: string; value: ReactNode; note: ReactNode }> }): ReactNode {
    if (props.rows.length === 0) {
        return <div className="sheet-empty">No workbook summary available yet.</div>;
    }

    return (
        <div className="summary-card-grid">
            {props.rows.map((row) => (
                <article key={row.label} className="summary-card-item">
                    <div className="summary-card-label">{row.label}</div>
                    <div className="summary-card-value">{row.value}</div>
                    <div className="summary-card-note">{row.note}</div>
                </article>
            ))}
        </div>
    );
}

function ControlList(props: { rows: Array<{ label: string; value: ReactNode; note: ReactNode }> }): ReactNode {
    if (props.rows.length === 0) {
        return <div className="sheet-empty">No ledger controls configured yet.</div>;
    }

    return (
        <ol className="control-list">
            {props.rows.map((row) => (
                <li key={row.label} className="control-item">
                    <span className="control-item-badge">{row.label}</span>
                    <div className="control-item-copy">
                        <p>{row.value}</p>
                        <small>{row.note}</small>
                    </div>
                </li>
            ))}
        </ol>
    );
}

function App(): ReactNode {
    const [view, setView] = useState<LedgerViewResponse | null>(null);
    const [pageStatus, setPageStatus] = useState<StatusMessage | null>(null);
    const [formStatus, setFormStatus] = useState<StatusMessage | null>(null);
    const [form, setForm] = useState<FormState>(resetForm());
    const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reviewingEntryId, setReviewingEntryId] = useState<string | null>(null);
    const { theme, setTheme, themeOptions } = useThemeMode();

    async function loadWorkbook(): Promise<void> {
        setLoading(true);

        try {
            await disableWaelioRuntimeCaching();
            const payload = await requestJson(
                `/api/private-ledger?ts=${Date.now()}`,
                { method: "GET" },
                parseLedgerViewResponse,
            );
            setView(payload);
            setForm((current) => current.subjectEmail ? current : resetForm(payload.viewer.email));
            setPageStatus(null);
        } catch (error) {
            if (getStatusCode(error) === 401) {
                window.location.href = LOGIN_PAGE;
                return;
            }

            setView(null);
            setPageStatus({
                tone: "error",
                text: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const handlePageHide = () => {
            void triggerExitLogout();
        };

        window.addEventListener("pagehide", handlePageHide);
        return () => {
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, []);

    useEffect(() => {
        void loadWorkbook();
    }, []);

    const viewerLabel = useMemo(
        () => getPartnerLabel(view?.partners, view?.viewer.email),
        [view?.partners, view?.viewer.email],
    );
    const otherPartner = useMemo(
        () => (view ? getOtherPartner(view.partners, view.viewer.email) : null),
        [view],
    );
    const otherPartnerLabel = otherPartner?.label ?? "Partner";

    const entries = view?.entries ?? [];
    const pendingEntries = entries.filter((entry) => entry.status === "pending");
    const websiteEntries = entries.filter((entry) => entry.kind === "expense" || entry.kind === "income");

    const viewerBalance = view?.summary.partnerBalances.find((partner) => partner.email === view.viewer.email);
    const partnerBalance = otherPartner
        ? view?.summary.partnerBalances.find((partner) => partner.email === otherPartner.email)
        : null;

    const overviewRows = view ? [
        {
            label: "Pending journal rows",
            value: view.summary.pendingCount,
            note: "Rows awaiting counterparty approval before posting",
        },
        {
            label: "Approved journal rows",
            value: view.summary.approvedCount,
            note: "Posted entries affecting balances and settlement",
        },
        {
            label: "Rejected journal rows",
            value: view.summary.rejectedCount,
            note: "Retained for audit visibility",
        },
        {
            label: "Audit chain",
            value: view.summary.integrity.ok ? `Clean · ${view.summary.integrity.events} events` : view.summary.integrity.reason,
            note: "Encrypted at rest and written to a tamper-evident chain",
        },
    ] : [];

    const balanceRows = view ? [
        {
            label: `${viewerLabel} sheet balance`,
            value: formatMoneyList(viewerBalance?.amounts, "Settled"),
            note: `${viewerLabel} position across approved entries`,
        },
        {
            label: `${otherPartnerLabel} sheet balance`,
            value: formatMoneyList(partnerBalance?.amounts, "Settled"),
            note: `${otherPartnerLabel} position across approved entries`,
        },
        {
            label: "Suggested settlement",
            value: view.summary.settlements.length > 0
                ? view.summary.settlements.map((item) => `${item.fromLabel} owes ${item.toLabel} ${formatMoney(item.amount, item.currency)}`).join(" · ")
                : "No settlement due",
            note: "Computed from approved liabilities, payments, expenses, and income",
        },
        {
            label: "Posted totals",
            value: [
                `Debt ${formatMoneyList(view.summary.totals.debt, "—")}`,
                `Payments ${formatMoneyList(view.summary.totals.payment, "—")}`,
                `Expenses ${formatMoneyList(view.summary.totals.expense, "—")}`,
                `Income ${formatMoneyList(view.summary.totals.income, "—")}`,
            ].join(" · "),
            note: "Approved totals only",
        },
    ] : [];

    const controlsRows = view?.rules.map((rule, index) => ({
        label: `Control ${index + 1}`,
        value: rule,
        note: "Workbook policy",
    })) ?? [];

    const formMeta = {
        kindHelp: getKindHelp(form.kind),
        titleHelp: getTitleHelp(form.kind),
        titlePlaceholder: getTitlePlaceholder(form.kind),
        detailsPlaceholder: getDetailsPlaceholder(form.kind),
        subjectLabel: getSubjectLabel(form.kind),
        titleLabel: getTitleLabel(form.kind),
        splitLabel: getSplitLabel(form.kind),
        showAmount: form.kind !== "note",
        showSubject: form.kind !== "note",
        showCurrency: form.kind !== "note",
        showSplit: form.kind === "expense" || form.kind === "income",
    };

    const myColumns: LedgerColumn[] = [
        { key: "date", label: "Date", cell: (entry) => formatDate(entry.createdAt) },
        { key: "status", label: "Status", cell: (entry) => <StatusPill status={entry.status} /> },
        { key: "kind", label: "Classification", cell: (entry) => getKindLabel(entry.kind) },
        { key: "title", label: "Title", cell: (entry) => entry.title },
        { key: "amount", label: "Amount", align: "right", cell: (entry) => getEntryAmount(entry) },
        {
            key: "effect",
            label: "Effect on me",
            cell: (entry) => {
                const effect = getParticipantEffect(entry, view?.viewer.email ?? "");
                return <span className={getEffectClass(effect)}>{formatSelfEffect(effect, entry.currency)}</span>;
            },
        },
        { key: "counterparty", label: "Counterparty", cell: (entry) => entry.counterpartyLabel ?? "—" },
        { key: "details", label: "Details", cell: (entry) => entry.details || "—" },
        { key: "review", label: "Review", cell: (entry) => getReviewSummary(entry) },
    ];

    const partnerColumns: LedgerColumn[] = [
        { key: "date", label: "Date", cell: (entry) => formatDate(entry.createdAt) },
        { key: "status", label: "Status", cell: (entry) => <StatusPill status={entry.status} /> },
        { key: "kind", label: "Classification", cell: (entry) => getKindLabel(entry.kind) },
        { key: "title", label: "Title", cell: (entry) => entry.title },
        { key: "amount", label: "Amount", align: "right", cell: (entry) => getEntryAmount(entry) },
        {
            key: "effect",
            label: `Effect on ${otherPartnerLabel}`,
            cell: (entry) => {
                const effect = getParticipantEffect(entry, otherPartner?.email ?? "");
                return <span className={getEffectClass(effect)}>{formatPartnerEffect(effect, entry.currency, otherPartnerLabel)}</span>;
            },
        },
        { key: "primary", label: "Primary partner", cell: (entry) => entry.subjectLabel ?? "—" },
        { key: "details", label: "Details", cell: (entry) => entry.details || "—" },
        { key: "review", label: "Review", cell: (entry) => getReviewSummary(entry) },
    ];

    const websiteColumns: LedgerColumn[] = [
        { key: "date", label: "Date", cell: (entry) => formatDate(entry.createdAt) },
        { key: "status", label: "Status", cell: (entry) => <StatusPill status={entry.status} /> },
        { key: "kind", label: "Classification", cell: (entry) => getKindLabel(entry.kind) },
        { key: "title", label: "Title", cell: (entry) => entry.title },
        { key: "recordedBy", label: "Recorded by", cell: (entry) => entry.subjectLabel ?? "—" },
        { key: "amount", label: "Amount", align: "right", cell: (entry) => getEntryAmount(entry) },
        {
            key: "websiteEffect",
            label: "Website effect",
            cell: (entry) => {
                const effect = getWebsiteEffect(entry);
                return <span className={getEffectClass(effect)}>{formatWebsiteEffect(effect, entry.currency)}</span>;
            },
        },
        { key: "split", label: "Split %", align: "right", cell: (entry) => entry.splitPercent ?? "—" },
        { key: "details", label: "Details", cell: (entry) => entry.details || "—" },
        { key: "review", label: "Review", cell: (entry) => getReviewSummary(entry) },
    ];

    const sharedColumns: LedgerColumn[] = [
        { key: "date", label: "Date", cell: (entry) => formatDate(entry.createdAt) },
        { key: "status", label: "Status", cell: (entry) => <StatusPill status={entry.status} /> },
        { key: "kind", label: "Classification", cell: (entry) => getKindLabel(entry.kind) },
        { key: "title", label: "Title", cell: (entry) => entry.title },
        { key: "primary", label: "Primary partner", cell: (entry) => entry.subjectLabel ?? "—" },
        { key: "counterparty", label: "Counterparty", cell: (entry) => entry.counterpartyLabel ?? "—" },
        { key: "amount", label: "Amount", align: "right", cell: (entry) => getEntryAmount(entry) },
        { key: "split", label: "Split %", align: "right", cell: (entry) => entry.splitPercent ?? "—" },
        { key: "provisional", label: "Provisional", cell: (entry) => <ProvisionalPill provisional={entry.isMaybe} /> },
        { key: "details", label: "Details", cell: (entry) => entry.details || "—" },
        { key: "review", label: "Review", cell: (entry) => getReviewSummary(entry) },
    ];

    const pendingColumns: LedgerColumn[] = [
        { key: "date", label: "Date", cell: (entry) => formatDate(entry.createdAt) },
        { key: "status", label: "Status", cell: (entry) => <StatusPill status={entry.status} /> },
        { key: "kind", label: "Classification", cell: (entry) => getKindLabel(entry.kind) },
        { key: "title", label: "Title", cell: (entry) => entry.title },
        { key: "primary", label: "Primary partner", cell: (entry) => entry.subjectLabel ?? "—" },
        { key: "amount", label: "Amount", align: "right", cell: (entry) => getEntryAmount(entry) },
        { key: "provisional", label: "Provisional", cell: (entry) => <ProvisionalPill provisional={entry.isMaybe} /> },
        { key: "details", label: "Details", cell: (entry) => entry.details || "—" },
        {
            key: "action",
            label: "Approval",
            cell: (entry) => entry.canReview ? (
                <div className="review-cell">
                    <textarea
                        className="review-note"
                        value={reviewNotes[entry.id] ?? ""}
                        placeholder="Optional approval or rejection note"
                        onChange={(event) => {
                            const value = event.target.value;
                            setReviewNotes((current) => ({ ...current, [entry.id]: value }));
                        }}
                    />
                    <div className="action-row">
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={reviewingEntryId === entry.id}
                            onClick={() => {
                                void handleReview(entry.id, "approved");
                            }}
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            className="btn-outline"
                            disabled={reviewingEntryId === entry.id}
                            onClick={() => {
                                void handleReview(entry.id, "rejected");
                            }}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ) : <span className="workbook-secondary">Waiting for counterparty</span>,
        },
    ];

    async function handleBack(): Promise<void> {
        await triggerExitLogout();

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = "/";
    }

    async function handleSignOut(): Promise<void> {
        await triggerExitLogout();
        window.location.href = "/";
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setFormStatus(null);

        try {
            setSubmitting(true);
            const payload: LedgerEntryInput = {
                kind: form.kind,
                title: form.title.trim(),
                details: withMaybePrefix(form.details, form.isMaybe),
                isMaybe: form.isMaybe,
            };

            if (form.kind !== "note") {
                payload.subjectEmail = form.subjectEmail;
                payload.amount = form.amount;
                payload.currency = form.currency;
            }

            if (form.kind === "expense" || form.kind === "income") {
                payload.splitPercent = form.splitPercent;
            }

            const nextView = await requestJson(
                "/api/private-ledger/entries",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                parseLedgerViewResponse,
            );

            setView(nextView);
            setForm(resetForm(nextView.viewer.email));
            setFormStatus({
                tone: "success",
                text: "Journal row submitted. It remains pending until the other partner approves it.",
            });
        } catch (error) {
            if (getStatusCode(error) === 401) {
                window.location.href = LOGIN_PAGE;
                return;
            }

            setFormStatus({
                tone: "error",
                text: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleReview(entryId: string, action: LedgerReviewAction): Promise<void> {
        try {
            setReviewingEntryId(entryId);
            setPageStatus({ tone: "info", text: "Saving review…" });

            const payload: LedgerReviewInput = {
                entryId,
                action,
                note: reviewNotes[entryId] ?? "",
            };

            const nextView = await requestJson(
                "/api/private-ledger/review",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
                parseLedgerViewResponse,
            );

            setView(nextView);
            setReviewNotes((current) => {
                const next = { ...current };
                delete next[entryId];
                return next;
            });
            setPageStatus({
                tone: action === "approved" ? "success" : "warning",
                text: action === "approved"
                    ? "Journal row approved and posted to the live balances."
                    : "Journal row rejected and retained in the audit history.",
            });
        } catch (error) {
            if (getStatusCode(error) === 401) {
                window.location.href = LOGIN_PAGE;
                return;
            }

            setPageStatus({
                tone: "error",
                text: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setReviewingEntryId(null);
        }
    }

    if (loading && !view) {
        return <div className="loading-state">Loading workbook…</div>;
    }

    if (!view) {
        const fallbackStatus = pageStatus ?? {
            tone: "error" as const,
            text: "The workbook request failed before any ledger data could be rendered.",
        };

        return (
            <div className="loading-state">
                <div className="sheet-panel workbook-fallback-card">
                    <div className="sheet-panel-header">
                        <div>
                            <h2>Unable to load the private workbook.</h2>
                            <p>The page shell loaded, but the workbook data request failed.</p>
                        </div>
                    </div>
                    <div className="sheet-panel-body">
                        <StatusBanner status={fallbackStatus} />
                        <div className="workbook-fallback-actions">
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                    void loadWorkbook();
                                }}
                            >
                                Retry load
                            </button>
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => {
                                    window.location.href = LOGIN_PAGE;
                                }}
                            >
                                Go to login
                            </button>
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                            >
                                Go home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="workbook-shell">
            <header className="workbook-header">
                <div className="workbook-brand">
                    <img src="/logo.png?v=20260502" alt="waelio logo" className="brand-lockup" />
                    <div className="workbook-brand-copy">
                        <h1>Private ledger workbook</h1>
                        <p>
                            {viewerLabel} · {otherPartnerLabel} · Website operations · Shared register
                        </p>
                    </div>
                </div>
                <div className="workbook-toolbar">
                    <span className="workbook-user">{view.viewer.name}</span>
                    <div className="theme-switcher" role="group" aria-label="Choose theme">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={theme === option.value ? "theme-option theme-option-active" : "theme-option"}
                                aria-pressed={theme === option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                }}
                            >
                                <span className="theme-option-icon" aria-hidden="true">{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                    <button type="button" className="btn-outline" onClick={() => { void handleBack(); }}>
                        Back and sign out
                    </button>
                    <a href="/private/agent" className="btn-outline">
                        Agent
                    </a>
                    <button type="button" className="btn-outline" onClick={() => exportWorkbook(view)}>
                        Export workbook
                    </button>
                    <button type="button" className="btn-outline" onClick={() => { void handleSignOut(); }}>
                        Sign out
                    </button>
                </div>
            </header>

            <main className="workbook-main">
                <StatusBanner status={pageStatus} />

                <div className="workbook-grid">
                    <SheetPanel
                        title="Workbook overview"
                        subtitle="High-level counts, audit status, and workbook state."
                    >
                        <SummaryCards rows={overviewRows} />
                    </SheetPanel>

                    <SheetPanel
                        title="Balances and settlement"
                        subtitle="Partner balances, settlement due, and approved totals."
                    >
                        <SummaryCards rows={balanceRows} />
                    </SheetPanel>

                    <SheetPanel
                        title="Ledger controls"
                        subtitle="Approval, audit, and correction rules without wasting half the page."
                    >
                        <ControlList rows={controlsRows} />
                    </SheetPanel>
                </div>

                <SheetPanel
                    title="Journal entry"
                    subtitle="Post a new row to the workbook. It remains pending until the counterparty approves it."
                >
                    <form className="sheet-form" onSubmit={(event) => { void handleSubmit(event); }}>
                        <div className="sheet-form-grid">
                            <div className="sheet-field">
                                <label htmlFor="entry-kind">Entry classification</label>
                                <select
                                    id="entry-kind"
                                    value={form.kind}
                                    onChange={(event) => {
                                        const kind = event.target.value as LedgerEntryKind;
                                        setForm((current) => ({ ...current, kind }));
                                    }}
                                >
                                    <option value="debt">Direct liability</option>
                                    <option value="payment">Settlement payment</option>
                                    <option value="expense">Shared expense</option>
                                    <option value="income">Shared income</option>
                                    <option value="note">Memo / note</option>
                                </select>
                                <p className="sheet-field-help">{formMeta.kindHelp}</p>
                            </div>

                            {formMeta.showSubject ? (
                                <div className="sheet-field">
                                    <label htmlFor="entry-subject">{formMeta.subjectLabel}</label>
                                    <select
                                        id="entry-subject"
                                        value={form.subjectEmail}
                                        onChange={(event) => {
                                            const subjectEmail = event.target.value;
                                            setForm((current) => ({ ...current, subjectEmail }));
                                        }}
                                    >
                                        {view.partners.map((partner) => (
                                            <option key={partner.email} value={partner.email}>
                                                {partner.label} ({partner.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : null}

                            <div className="sheet-field sheet-field-wide">
                                <label htmlFor="entry-title">{formMeta.titleLabel}</label>
                                <input
                                    id="entry-title"
                                    type="text"
                                    value={form.title}
                                    maxLength={140}
                                    placeholder={formMeta.titlePlaceholder}
                                    onChange={(event) => {
                                        const title = event.target.value;
                                        setForm((current) => ({ ...current, title }));
                                    }}
                                    required
                                />
                                <p className="sheet-field-help">{formMeta.titleHelp}</p>
                            </div>

                            {formMeta.showAmount ? (
                                <div className="sheet-field">
                                    <label htmlFor="entry-amount">Amount</label>
                                    <input
                                        id="entry-amount"
                                        type="number"
                                        value={form.amount}
                                        min="0.01"
                                        step="0.01"
                                        placeholder="0.00"
                                        onChange={(event) => {
                                            const amount = event.target.value;
                                            setForm((current) => ({ ...current, amount }));
                                        }}
                                        required
                                    />
                                </div>
                            ) : null}

                            {formMeta.showCurrency ? (
                                <div className="sheet-field">
                                    <label htmlFor="entry-currency">Currency</label>
                                    <select
                                        id="entry-currency"
                                        value={form.currency}
                                        onChange={(event) => {
                                            const currency = event.target.value;
                                            setForm((current) => ({ ...current, currency }));
                                        }}
                                    >
                                        <option value="USD">USD — Dollar ($)</option>
                                        <option value="ILS">ILS — Shekel (₪)</option>
                                    </select>
                                    <p className="sheet-field-help">Use the same currency the original transaction was recorded in.</p>
                                </div>
                            ) : null}

                            {formMeta.showSplit ? (
                                <div className="sheet-field">
                                    <label htmlFor="entry-split">{formMeta.splitLabel}</label>
                                    <input
                                        id="entry-split"
                                        type="number"
                                        value={form.splitPercent}
                                        min="0"
                                        max="100"
                                        step="1"
                                        onChange={(event) => {
                                            const splitPercent = event.target.value;
                                            setForm((current) => ({ ...current, splitPercent }));
                                        }}
                                        required
                                    />
                                </div>
                            ) : null}

                            <div className="sheet-field sheet-field-wide">
                                <label htmlFor="entry-details">Details</label>
                                <textarea
                                    id="entry-details"
                                    rows={4}
                                    value={form.details}
                                    maxLength={4000}
                                    placeholder={formMeta.detailsPlaceholder}
                                    onChange={(event) => {
                                        const details = event.target.value;
                                        setForm((current) => ({ ...current, details }));
                                    }}
                                />
                            </div>

                            <div className="sheet-field sheet-field-wide">
                                <label className="sheet-checkbox" htmlFor="entry-is-maybe">
                                    <input
                                        id="entry-is-maybe"
                                        type="checkbox"
                                        checked={form.isMaybe}
                                        onChange={(event) => {
                                            const isMaybe = event.target.checked;
                                            setForm((current) => ({ ...current, isMaybe }));
                                        }}
                                    />
                                    <span className="sheet-checkbox-copy">
                                        <strong>Provisional / subject to confirmation</strong>
                                        <small>
                                            Mark the row as provisional if it still needs partner confirmation or supporting documents.
                                        </small>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <StatusBanner status={formStatus} />

                        <div className="sheet-form-actions">
                            <span className="workbook-secondary">
                                Spreadsheet-style posting screen for the shared business workbook.
                            </span>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? "Submitting…" : "Submit journal row"}
                            </button>
                        </div>
                    </form>
                </SheetPanel>

                <SheetPanel
                    title="Pending approvals"
                    subtitle="Rows awaiting counterparty approval before they post to balances."
                >
                    <LedgerTable
                        columns={pendingColumns}
                        entries={pendingEntries}
                        emptyMessage="No pending approvals right now."
                    />
                </SheetPanel>

                <SheetPanel
                    title={`${viewerLabel} ledger`}
                    subtitle="Personal worksheet showing how each row affects your position."
                >
                    <LedgerTable
                        columns={myColumns}
                        entries={entries}
                        emptyMessage="No workbook rows available yet."
                    />
                </SheetPanel>

                <SheetPanel
                    title={`${otherPartnerLabel} ledger`}
                    subtitle="Counterparty worksheet showing how each row affects your partner."
                >
                    <LedgerTable
                        columns={partnerColumns}
                        entries={entries}
                        emptyMessage="No workbook rows available yet."
                    />
                </SheetPanel>

                <SheetPanel
                    title="Website operations"
                    subtitle="Income and expense rows for the website or operating business."
                >
                    <LedgerTable
                        columns={websiteColumns}
                        entries={websiteEntries}
                        emptyMessage="No website income or expense rows yet."
                    />
                </SheetPanel>

                <SheetPanel
                    title="Shared register"
                    subtitle="Complete register of every approved, pending, rejected, and memo row."
                >
                    <LedgerTable
                        columns={sharedColumns}
                        entries={entries}
                        emptyMessage="No workbook rows available yet."
                    />
                </SheetPanel>
            </main>
        </div>
    );
}

const container = document.getElementById("app");
if (!container) {
    throw new Error("Missing app root");
}

createRoot(container).render(<App />);
