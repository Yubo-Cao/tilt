"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/lib/problems";

interface ProblemContentProps {
  blocks: ContentBlock[];
  className?: string;
}

export function ProblemContent({ blocks, className }: ProblemContentProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, index) => (
        <ContentBlockRenderer key={index} block={block} />
      ))}
    </div>
  );
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "markdown":
      return (
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{
              // Custom table styling
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-white/20 rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-white/10">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="border border-white/20 px-4 py-2 text-left font-semibold text-white">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-white/20 px-4 py-2 text-white/90">
                  {children}
                </td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-white/5 transition-colors">{children}</tr>
              ),
              // Strikethrough
              del: ({ children }) => (
                <del className="text-white/50 line-through">{children}</del>
              ),
              // Task list items
              li: ({ children, className }) => {
                const isTaskItem = className?.includes("task-list-item");
                return (
                  <li
                    className={cn(
                      "text-white/90",
                      isTaskItem && "list-none flex items-start gap-2"
                    )}
                  >
                    {children}
                  </li>
                );
              },
              input: ({ checked, type }) => {
                if (type === "checkbox") {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-primary-500 focus:ring-primary-500"
                    />
                  );
                }
                return <input type={type} />;
              },
              // Code blocks
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="bg-white/10 text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className={cn(
                      "block bg-black/40 p-4 rounded-lg overflow-x-auto text-sm font-mono text-white/90",
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="my-4 overflow-x-auto">{children}</pre>
              ),
              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
                >
                  {children}
                </a>
              ),
              // Headings
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-white mt-6 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-white mt-5 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base font-semibold text-white mt-3 mb-2">{children}</h4>
              ),
              // Paragraphs
              p: ({ children }) => (
                <p className="text-white/90 leading-relaxed mb-4 last:mb-0">{children}</p>
              ),
              // Lists
              ul: ({ children, className }) => {
                const isTaskList = className?.includes("contains-task-list");
                return (
                  <ul
                    className={cn(
                      "mb-4 space-y-2",
                      isTaskList ? "list-none pl-0" : "list-disc pl-6"
                    )}
                  >
                    {children}
                  </ul>
                );
              },
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
              ),
              // Blockquote
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 my-4 text-white/70 italic">
                  {children}
                </blockquote>
              ),
              // Horizontal rule
              hr: () => <hr className="my-6 border-white/20" />,
              // Strong/Bold
              strong: ({ children }) => (
                <strong className="font-bold text-white">{children}</strong>
              ),
              // Emphasis/Italic
              em: ({ children }) => (
                <em className="italic text-white/90">{children}</em>
              ),
              // Images
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt || ""}
                  className="max-w-full h-auto rounded-lg my-4"
                />
              ),
            }}
          >
            {block.content}
          </ReactMarkdown>
        </div>
      );

    case "video":
      return (
        <div className="relative w-full aspect-video rounded-[12px] overflow-hidden bg-black/50">
          <video
            src={block.content}
            controls
            className="w-full h-full object-contain"
            playsInline
          />
        </div>
      );

    case "image":
      return (
        <div className="relative w-full rounded-[12px] overflow-hidden">
          <img
            src={block.content}
            alt="Problem content"
            className="w-full h-auto object-contain max-h-[60vh]"
          />
        </div>
      );

    default:
      return null;
  }
}
