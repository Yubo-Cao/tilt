"use client";

import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  cellSize?: number;
  strokeColor?: string;
  fade?: boolean;
}

export function GridPattern({
  className,
  cellSize = 64,
  strokeColor = "rgba(59, 130, 246, 0.08)",
  fade = true,
}: GridPatternProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1"
            />
          </pattern>
          {fade && (
            <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          )}
          {fade && (
            <mask id="grid-mask">
              <rect width="100%" height="100%" fill="url(#grid-fade)" />
            </mask>
          )}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          mask={fade ? "url(#grid-mask)" : undefined}
        />
      </svg>
    </div>
  );
}
