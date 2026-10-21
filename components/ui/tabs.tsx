"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Presentational tab strip with internal selection state.
 * `underline` = trading-panel style; `pill` = segmented chip style.
 */
export function Tabs({
  items,
  defaultActive = 0,
  variant = "underline",
  size = "sm",
  className,
  onChange,
}: {
  items: string[];
  defaultActive?: number;
  variant?: "underline" | "pill";
  size?: "sm" | "md";
  className?: string;
  onChange?: (index: number) => void;
}) {
  const [active, setActive] = useState(defaultActive);

  const select = (i: number) => {
    setActive(i);
    onChange?.(i);
  };

  if (variant === "pill") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            onClick={() => select(i)}
            className={cn(
              "rounded-pill font-medium interactive",
              size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              i === active
                ? "bg-white/[0.08] text-fg"
                : "text-fg-muted hover:text-fg-secondary",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-5 border-b border-border", className)}>
      {items.map((item, i) => (
        <button
          key={item}
          type="button"
          onClick={() => select(i)}
          className={cn(
            "-mb-px border-b pb-2 font-medium interactive",
            size === "sm" ? "text-xs" : "text-sm",
            i === active
              ? "border-fg text-fg"
              : "border-transparent text-fg-muted hover:text-fg-secondary",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
