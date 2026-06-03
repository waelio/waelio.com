import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

/** Strip executable script tags from npm README HTML before render. */
export function sanitizeReadmeSource(source: string): string {
    return source.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

export function ReadmeMarkdown(props: { source: string; className?: string }): ReactNode {
    const className = props.className ?? "docs-readme";
    const cleaned = sanitizeReadmeSource(props.source);

    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
                {cleaned}
            </ReactMarkdown>
        </div>
    );
}
