"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProblemContent } from "@/components/problem/problem-content";
import type { Problem } from "@/lib/db/schema";
import type { ContentBlock } from "@/lib/problems";

interface ProblemEditorClientProps {
  problem: Problem | null;
}

type BlockType = "markdown" | "video" | "image";

export function ProblemEditorClient({ problem }: ProblemEditorClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [title, setTitle] = useState(problem?.title || "");
  const [questionBlocks, setQuestionBlocks] = useState<ContentBlock[]>(
    problem ? JSON.parse(problem.questionBlocks) : [{ type: "markdown", content: "" }]
  );
  const [answerBlocks, setAnswerBlocks] = useState<ContentBlock[]>(
    problem ? JSON.parse(problem.answerBlocks) : [{ type: "markdown", content: "" }]
  );
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(
    problem?.backgroundVideoUrl || ""
  );
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState(
    problem?.backgroundMusicUrl || ""
  );
  const [effect, setEffect] = useState<"none" | "jitter" | "confetti">(
    problem?.effect || "none"
  );
  const [isPublished, setIsPublished] = useState(problem?.isPublished || false);

  const addBlock = (
    blocks: ContentBlock[],
    setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>,
    type: BlockType
  ) => {
    setBlocks([...blocks, { type, content: "" }]);
  };

  const updateBlock = (
    blocks: ContentBlock[],
    setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>,
    index: number,
    content: string
  ) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content };
    setBlocks(newBlocks);
  };

  const removeBlock = (
    blocks: ContentBlock[],
    setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>,
    index: number
  ) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        title,
        questionBlocks: JSON.stringify(questionBlocks),
        answerBlocks: JSON.stringify(answerBlocks),
        backgroundVideoUrl: backgroundVideoUrl || null,
        backgroundMusicUrl: backgroundMusicUrl || null,
        effect,
        isPublished,
      };

      const url = problem
        ? `/api/admin/problems/${problem.id}`
        : "/api/admin/problems";

      const response = await fetch(url, {
        method: problem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/problems");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save problem");
      }
    } catch (error) {
      console.error("Error saving problem:", error);
      alert("Failed to save problem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary-950/20 px-6 py-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <Link href="/problems">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Problems
          </motion.button>
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {problem ? "Edit Problem" : "New Problem"}
          </h1>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 font-medium rounded-[12px] border transition-colors",
                showPreview
                  ? "bg-primary-500/20 border-primary-500/50 text-primary-500"
                  : "border-zinc-200 dark:border-zinc-800 text-foreground-secondary hover:text-foreground"
              )}
            >
              <Eye className="w-4 h-4" />
              Preview
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 px-6 py-2 font-semibold text-white",
                "bg-gradient-to-b from-primary-400 to-primary-500",
                "rounded-[12px] shadow-[0_4px_20px_rgba(59,130,246,0.4)]",
                "disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {showPreview ? (
          /* Preview Mode */
          <div className="space-y-6">
            <div className="glass rounded-[20px] p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">{title || "Untitled"}</h2>
              <h3 className="text-sm font-medium text-foreground-secondary mb-4">Question</h3>
              <ProblemContent blocks={questionBlocks} />
            </div>
            <div className="glass rounded-[20px] p-6 border-2 border-primary-500/30">
              <h3 className="text-sm font-medium text-primary-400 mb-4">Answer</h3>
              <ProblemContent blocks={answerBlocks} />
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <>
            {/* Title */}
            <section>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Problem title"
                className={cn(
                  "w-full px-4 py-3 rounded-[12px]",
                  "bg-zinc-50 dark:bg-zinc-900",
                  "border border-zinc-200 dark:border-zinc-800",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                  "text-foreground"
                )}
              />
            </section>

            {/* Question Blocks */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-foreground">
                  Question Blocks
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => addBlock(questionBlocks, setQuestionBlocks, "markdown")}
                    className="px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-500 rounded-lg"
                  >
                    + Markdown
                  </button>
                  <button
                    onClick={() => addBlock(questionBlocks, setQuestionBlocks, "video")}
                    className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-500 rounded-lg"
                  >
                    + Video
                  </button>
                  <button
                    onClick={() => addBlock(questionBlocks, setQuestionBlocks, "image")}
                    className="px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-lg"
                  >
                    + Image
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {questionBlocks.map((block, index) => (
                  <BlockEditor
                    key={index}
                    block={block}
                    onUpdate={(content) =>
                      updateBlock(questionBlocks, setQuestionBlocks, index, content)
                    }
                    onRemove={() =>
                      removeBlock(questionBlocks, setQuestionBlocks, index)
                    }
                    canRemove={questionBlocks.length > 1}
                  />
                ))}
              </div>
            </section>

            {/* Answer Blocks */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-foreground">
                  Answer Blocks
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => addBlock(answerBlocks, setAnswerBlocks, "markdown")}
                    className="px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-500 rounded-lg"
                  >
                    + Markdown
                  </button>
                  <button
                    onClick={() => addBlock(answerBlocks, setAnswerBlocks, "video")}
                    className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-500 rounded-lg"
                  >
                    + Video
                  </button>
                  <button
                    onClick={() => addBlock(answerBlocks, setAnswerBlocks, "image")}
                    className="px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-lg"
                  >
                    + Image
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {answerBlocks.map((block, index) => (
                  <BlockEditor
                    key={index}
                    block={block}
                    onUpdate={(content) =>
                      updateBlock(answerBlocks, setAnswerBlocks, index, content)
                    }
                    onRemove={() =>
                      removeBlock(answerBlocks, setAnswerBlocks, index)
                    }
                    canRemove={answerBlocks.length > 1}
                  />
                ))}
              </div>
            </section>

            {/* Settings */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Background Video URL (optional)
                </label>
                <input
                  type="url"
                  value={backgroundVideoUrl}
                  onChange={(e) => setBackgroundVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className={cn(
                    "w-full px-4 py-3 rounded-[12px]",
                    "bg-zinc-50 dark:bg-zinc-900",
                    "border border-zinc-200 dark:border-zinc-800",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                    "text-foreground"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Background Music URL (optional)
                </label>
                <input
                  type="url"
                  value={backgroundMusicUrl}
                  onChange={(e) => setBackgroundMusicUrl(e.target.value)}
                  placeholder="https://..."
                  className={cn(
                    "w-full px-4 py-3 rounded-[12px]",
                    "bg-zinc-50 dark:bg-zinc-900",
                    "border border-zinc-200 dark:border-zinc-800",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                    "text-foreground"
                  )}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Effect
                </label>
                <select
                  value={effect}
                  onChange={(e) => setEffect(e.target.value as typeof effect)}
                  className={cn(
                    "w-full px-4 py-3 rounded-[12px]",
                    "bg-zinc-50 dark:bg-zinc-900",
                    "border border-zinc-200 dark:border-zinc-800",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                    "text-foreground"
                  )}
                >
                  <option value="none">None</option>
                  <option value="jitter">Jitter</option>
                  <option value="confetti">Confetti</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-foreground">
                    Published (visible in feed)
                  </span>
                </label>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

interface BlockEditorProps {
  block: ContentBlock;
  onUpdate: (content: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function BlockEditor({ block, onUpdate, onRemove, canRemove }: BlockEditorProps) {
  const typeLabels = {
    markdown: "Markdown (supports LaTeX)",
    video: "Video URL",
    image: "Image URL",
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "px-2 py-1 text-xs font-medium rounded",
            block.type === "markdown"
              ? "bg-primary-500/20 text-primary-500"
              : block.type === "video"
              ? "bg-emerald-500/20 text-emerald-500"
              : "bg-amber-500/20 text-amber-500"
          )}
        >
          {typeLabels[block.type]}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {block.type === "markdown" ? (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Enter markdown content... (supports LaTeX: $x^2$ or $$\int_0^1 f(x)dx$$)"
          rows={6}
          className={cn(
            "w-full px-4 py-3 rounded-[12px]",
            "bg-zinc-50 dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            "text-foreground font-mono text-sm resize-y"
          )}
        />
      ) : (
        <input
          type="url"
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder={`Enter ${block.type} URL...`}
          className={cn(
            "w-full px-4 py-3 rounded-[12px]",
            "bg-zinc-50 dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
            "text-foreground"
          )}
        />
      )}
    </div>
  );
}
