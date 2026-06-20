import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "indigo" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary" | "indigo" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "min-h-[32px] px-3 text-xs gap-1.5",
  md: "min-h-[42px] px-4 text-sm gap-2",
  lg: "min-h-[50px] px-6 text-sm gap-2.5",
};

const variants = {
  primary: "btn-primary rounded-xl",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all duration-150",
  indigo: "bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 transition-all duration-150",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-ink border-0 rounded-xl transition-all duration-150",
  outline: "bg-transparent text-ink border border-[rgba(99,179,237,0.15)] hover:border-[rgba(0,212,170,0.35)] hover:text-accent rounded-xl transition-all duration-150",
  danger: "bg-transparent text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl transition-all duration-150",
};

const base = "inline-flex items-center justify-center font-bold select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] transition-all duration-150";

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}

export function LinkButton({ className, variant = "primary", size = "md", href, ...props }: LinkButtonProps) {
  return <Link href={href} className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}
