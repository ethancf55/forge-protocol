import type { ContentAccess } from "@/content/types";
import { cn } from "@/lib/utils";

export function AccessBadge({
  access,
  className,
}: {
  access: ContentAccess;
  className?: string;
}) {
  const paid = access === "paid";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        paid
          ? "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30"
          : "bg-white/5 text-zinc-400 ring-1 ring-white/10",
        className
      )}
    >
      {paid ? "Premium" : "Free"}
    </span>
  );
}
