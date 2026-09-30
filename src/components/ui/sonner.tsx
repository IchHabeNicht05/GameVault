"use client";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-panel-raised! border-border-strong! text-text-primary! shadow-2xl! rounded-xl!",
          description: "text-text-muted!",
          actionButton: "bg-plasma! text-white!",
          cancelButton: "bg-white/10! text-text-secondary!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
