import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_4px_24px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_32px_rgba(249,115,22,0.4)]",
        variant === "secondary" &&
          "border border-white/15 bg-white/5 text-zinc-100 hover:border-orange-500/50 hover:text-orange-300",
        variant === "ghost" && "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
        variant === "danger" && "bg-red-500/15 text-red-300 border border-red-500/30",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    />
  );
}
