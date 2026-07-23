import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn("font-semibold text-zinc-100 tracking-tight", className)}>
      {children}
    </h3>
  );
}
