import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Tiny, safe Markdown subset for admin-written blog posts: "## headings", "- lists",
 * **bold**, [links](https://…) and paragraphs. It builds React elements (never raw HTML),
 * so nothing an editor types can inject scripts.
 */
export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className="ay-prose">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) return <h2 key={i}>{inline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith("### "))
          return (
            <h3 key={i} className="mt-6 text-lg font-semibold">
              {inline(trimmed.slice(4))}
            </h3>
          );
        const lines = trimmed.split("\n");
        if (lines.every((l) => /^[-*] /.test(l.trim()))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(trimmed.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) parts.push(<strong key={key++}>{match[1]}</strong>);
    else if (match[2] !== undefined && match[3] !== undefined) {
      const external = match[3].startsWith("http");
      parts.push(
        external ? (
          <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer nofollow">
            {match[2]}
          </a>
        ) : (
          // Internal links navigate inside the app instead of reloading the page.
          <Link key={key++} to={match[3]}>
            {match[2]}
          </Link>
        ),
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
