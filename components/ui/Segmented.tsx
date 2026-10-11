"use client";

import { motion } from "framer-motion";

type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  /** Unique per instance, so the sliding pill does not jump between groups. */
  id: string;
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** A small radio group with a pill that slides to the active option. */
export function Segmented<T extends string>({ id, label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full border border-white/20 p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full px-4 py-1.5 font-mono text-xs transition-colors ${
              active ? "text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
