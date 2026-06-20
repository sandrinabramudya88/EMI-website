import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "teal" | "blue" | "amber" | "rose" | "red" | "slate" | "dim";
};

const tones = {
  accent: "bg-accent/10 text-accent border-accent/20",
  teal:   "bg-teal-500/10 text-teal-700 border-teal-500/20",
  blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  amber:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rose:   "bg-rose-500/10 text-rose-600 border-rose-500/20",
  red:    "bg-red-500/10 text-red-400 border-red-500/20",
  slate:  "bg-slate-100 text-slate-600 border-slate-200",
  dim:    "bg-surface-3 text-muted border-border-bright",
};

export function Badge({ className, tone = "dim", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
