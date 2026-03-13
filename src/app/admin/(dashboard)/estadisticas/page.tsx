import { createAdminClient } from "@/lib/supabase/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  views: number;
  created_at: string;
  published: boolean;
  category: { name: string; color: string } | null;
}

interface MonthBucket {
  label: string;
  count: number;
}

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const supabase = createAdminClient();

  // ── 1. Fetch all data in parallel ────────────────────────────────────────
  const [
    { count: totalPublished },
    { data: allArticles },
    { count: unreadContacts },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("published", true),

    supabase
      .from("articles")
      .select(
        "id, title, slug, views, created_at, published, category:categories(name, color)"
      )
      .returns<ArticleRow[]>(),

    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
  ]);

  const articles: ArticleRow[] = allArticles ?? [];

  // ── 2. Compute summary stats ──────────────────────────────────────────────
  const totalViews = articles.reduce((sum, a) => sum + (a.views ?? 0), 0);

  const startOfThisMonth = startOfMonth(new Date());
  const articlesThisMonth = articles.filter(
    (a) => new Date(a.created_at) >= startOfThisMonth
  ).length;

  // ── 3. Top 10 most-read articles ─────────────────────────────────────────
  const top10 = [...articles]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 10);

  const maxViews = top10[0]?.views ?? 1;

  // ── 4. Articles per category ──────────────────────────────────────────────
  const categoryMap = new Map<
    string,
    { name: string; color: string; count: number }
  >();

  for (const article of articles) {
    if (!article.category) continue;
    const key = article.category.name;
    const existing = categoryMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(key, {
        name: article.category.name,
        color: article.category.color,
        count: 1,
      });
    }
  }

  const categoryStats = Array.from(categoryMap.values()).sort(
    (a, b) => b.count - a.count
  );
  const maxCategoryCount = categoryStats[0]?.count ?? 1;

  // ── 5. Articles published per month (last 6 months) ──────────────────────
  const now = new Date();
  const monthBuckets: MonthBucket[] = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const count = articles.filter((a) => {
      const d = new Date(a.created_at);
      return d >= start && d <= end;
    }).length;
    return {
      label: format(date, "MMM yy", { locale: es }),
      count,
    };
  });

  const maxMonthCount = Math.max(...monthBuckets.map((b) => b.count), 1);

  // ── 6. Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      <AdminHeader title="Estadísticas" />

      <div className="p-4 md:p-6 space-y-8">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Artículos publicados"
            value={totalPublished ?? 0}
            icon="📰"
            accent="#E30613"
          />
          <SummaryCard
            label="Total de vistas"
            value={totalViews.toLocaleString("es-AR")}
            icon="👁️"
            accent="#2563EB"
          />
          <SummaryCard
            label="Mensajes sin leer"
            value={unreadContacts ?? 0}
            icon="✉️"
            accent={unreadContacts ? "#E30613" : "#16A34A"}
          />
          <SummaryCard
            label="Artículos este mes"
            value={articlesThisMonth}
            icon="📅"
            accent="#9333EA"
          />
        </div>

        {/* ── Top 10 most-read ── */}
        <section className="bg-white rounded-xl border border-surface-border shadow-sm">
          <div className="px-6 py-4 border-b border-surface-border">
            <h3 className="font-semibold text-heading text-base">
              Top 10 artículos más leídos
            </h3>
          </div>

          {top10.length === 0 ? (
            <p className="px-6 py-8 text-center text-muted">
              Todavía no hay datos de vistas.
            </p>
          ) : (
            <ul className="px-6 py-4 space-y-3">
              {top10.map((article, idx) => {
                const pct =
                  maxViews > 0
                    ? Math.round(((article.views ?? 0) / maxViews) * 100)
                    : 0;
                return (
                  <li key={article.id}>
                    <div className="flex items-center justify-between mb-1 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-muted w-5 flex-shrink-0 text-right">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-heading truncate">
                          {article.title}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-muted flex-shrink-0 tabular-nums">
                        {(article.views ?? 0).toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden ml-7">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            article.category?.color ?? "#E30613",
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Bottom two charts side-by-side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Artículos por categoría */}
          <section className="bg-white rounded-xl border border-surface-border shadow-sm">
            <div className="px-6 py-4 border-b border-surface-border">
              <h3 className="font-semibold text-heading text-base">
                Artículos por categoría
              </h3>
            </div>

            {categoryStats.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted">
                Sin datos de categorías.
              </p>
            ) : (
              <ul className="px-6 py-4 space-y-3">
                {categoryStats.map((cat) => {
                  const pct =
                    maxCategoryCount > 0
                      ? Math.round((cat.count / maxCategoryCount) * 100)
                      : 0;
                  return (
                    <li key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm text-heading">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-muted tabular-nums">
                          {cat.count}
                        </span>
                      </div>
                      <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Artículos publicados por mes */}
          <section className="bg-white rounded-xl border border-surface-border shadow-sm">
            <div className="px-6 py-4 border-b border-surface-border">
              <h3 className="font-semibold text-heading text-base">
                Artículos por mes (últimos 6 meses)
              </h3>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-end justify-between gap-2 h-36">
                {monthBuckets.map((bucket) => {
                  const heightPct =
                    maxMonthCount > 0
                      ? Math.round((bucket.count / maxMonthCount) * 100)
                      : 0;
                  return (
                    <div
                      key={bucket.label}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <span className="text-xs font-semibold text-heading tabular-nums">
                        {bucket.count > 0 ? bucket.count : ""}
                      </span>
                      <div className="w-full bg-surface rounded-t-sm overflow-hidden flex items-end h-24">
                        <div
                          className="w-full rounded-t-sm transition-all"
                          style={{
                            height: `${Math.max(heightPct, bucket.count > 0 ? 4 : 0)}%`,
                            backgroundColor: "#E30613",
                            opacity: heightPct > 0 ? 0.75 + (heightPct / 100) * 0.25 : 0.15,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted capitalize">
                        {bucket.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// ── Sub-component: summary card ───────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted leading-tight">{label}</span>
        <span className="text-xl leading-none">{icon}</span>
      </div>
      <p
        className="text-3xl font-bold tabular-nums leading-none"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}
