import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-plasma text-white shadow-[0_0_0_1px_rgba(124,92,255,0.4),0_8px_24px_-8px_rgba(124,92,255,0.6)] hover:bg-[#8f6dff] hover:shadow-[0_0_0_1px_rgba(124,92,255,0.6),0_12px_32px_-8px_rgba(124,92,255,0.8)] active:scale-[0.98]",
        ember:
          "bg-ember text-white shadow-[0_8px_24px_-8px_rgba(255,92,53,0.6)] hover:bg-[#ff7452] active:scale-[0.98]",
        outline:
          "border border-border-strong bg-white/[0.02] text-text-primary hover:bg-white/[0.06] hover:border-white/20",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-white/[0.06]",
        glass: "glass text-text-primary hover:bg-white/[0.08]",
        link: "text-plasma-soft underline-offset-4 hover:underline",
        destructive: "bg-red-500/90 text-white hover:bg-red-500",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3.5 text-[13px]",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-cursor="pointer"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
