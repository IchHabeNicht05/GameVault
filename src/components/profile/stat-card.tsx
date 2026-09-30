import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  accent = "plasma",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "plasma" | "ember" | "gold" | "emerald";
}) {
  const accentClass = {
    plasma: "text-plasma-soft bg-plasma/10",
    ember: "text-ember-soft bg-ember/10",
    gold: "text-gold bg-gold/10",
    emerald: "text-emerald bg-emerald/10",
  }[accent];

  return (
    <div className="rounded-2xl border border-border-soft bg-panel/60 p-5">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", accentClass)}>{icon}</div>
      <div className="font-stat text-2xl font-semibold text-text-primary">{value}</div>
      <div className="mt-1 text-xs text-text-muted">{label}</div>
    </div>
  );
}
