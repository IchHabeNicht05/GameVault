"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  "Právě hraji": "#7c5cff",
  "Dokončeno": "#34d399",
  "V plánu": "#f2b84b",
  "Odloženo": "#ff5c35",
};

export function LibraryStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return <p className="text-sm text-text-muted">Zatím žádné hry v knihovně.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={filtered} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {filtered.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? "#7c5cff"} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#191c26", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, fontSize: 12 }}
          itemStyle={{ color: "#f4f5f7" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
