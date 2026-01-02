"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
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
        <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary-400 prose-a:text-primary-400">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
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
