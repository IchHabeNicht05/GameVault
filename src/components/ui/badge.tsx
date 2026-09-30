import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-border-soft bg-white/[0.04] text-text-secondary",
        plasma: "border-plasma/30 bg-plasma/15 text-plasma-soft",
        ember: "border-ember/30 bg-ember/15 text-ember-soft",
        gold: "border-gold/30 bg-gold/15 text-gold",
        emerald: "border-emerald/30 bg-emerald/15 text-emerald",
        outline: "border-border-strong bg-transparent text-text-primary",
        solid: "border-transparent bg-plasma text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
