import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ReportStatusControls } from "@/components/admin/report-status-controls";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Nahlášení" };

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { username: true } },
      targetUser: { select: { username: true } },
      review: { select: { title: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Nahlášení a moderace</h1>
      <p className="mt-1 text-text-muted">{reports.filter((r) => r.status === "PENDING").length} čekajících na vyřízení.</p>

      <div className="mt-6 space-y-3">
        {reports.length === 0 && <p className="text-sm text-text-muted">Žádná nahlášení.</p>}
        {reports.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-border-soft bg-panel/40 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={r.status === "PENDING" ? "ember" : r.status === "RESOLVED" ? "emerald" : "default"}>
                  {r.status}
                </Badge>
                <span className="text-xs text-text-muted">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                <strong className="text-text-primary">@{r.reporter.username}</strong> nahlásil(a){" "}
                {r.targetUser ? <>uživatele <strong className="text-text-primary">@{r.targetUser.username}</strong></> : null}
                {r.review ? <>recenzi <strong className="text-text-primary">„{r.review.title}“</strong></> : null}
              </p>
              <p className="mt-1 text-sm text-text-muted">Důvod: {r.reason}</p>
              {r.details && <p className="mt-1 text-xs text-text-muted">{r.details}</p>}
            </div>
            <ReportStatusControls reportId={r.id} status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
