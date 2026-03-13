import { createAdminClient } from "@/lib/supabase/admin";
import AdminHeader from "@/components/admin/AdminHeader";
import { format, subMonths, subDays, startOfMonth, endOfMonth, startOfDay } from "date-fns";
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

interface DayBucket {
  date: string;
  label: string;
  count: number;
}

interface SourceCount {
  source: string;
  count: number;
  color: string;
  label: string;
}

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  direct: { label: "Directo", color: "#6B7280" },
  google: { label: "Google", color: "#4285F4" },
  facebook: { label: "Facebook", color: "#1877F2" },
  twitter: { label: "Twitter/X", color: "#000000" },
  whatsapp: { label: "WhatsApp", color: "#25D366" },
  instagram: { label: "Instagram", color: "#E4405F" },
  tiktok: { label: "TikTok", color: "#010101" },
  telegram: { label: "Telegram", color: "#0088CC" },
  other: { label: "Otros", color: "#9CA3AF" },
};

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const supabase = createAdminClient();

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 29);
  const startOf30Days = startOfDay(thirtyDaysAgo);
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const sevenDaysAgo = startOfDay(subDays(now, 6));

  // ── 1. Fetch all data in parallel ────────────────────────────────────────
  const [
    { count: totalPublished },
    { data: allArticles },
    { count: unreadContacts },
    { data: pageViews },
    { count: viewsToday },
    { count: viewsYesterday },
    { count: viewsWeek },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("published", true)
      .is("deleted_at", null),

    supabase
      .from("articles")
      .select(
        "id, title, slug, views, created_at, published, category:categories(name, color)"
      )
      .is("deleted_at", null)
      .returns<ArticleRow[]>(),

    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("read", false),

    // Page views last 30 days for chart + sources
    supabase
      .from("page_views")
      .select("viewed_at, referrer_source")
      .gte("viewed_at", startOf30Days.toISOString())
      .order("viewed_at", { ascending: true }),

    // Views today
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("viewed_at", todayStart.toISOString()),

    // Views yesterday
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("viewed_at", yesterdayStart.toISOString())
      .lt("viewed_at", todayStart.toISOString()),

    // Views this week
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("viewed_at", sevenDaysAgo.toISOString()),
  ]);

  const articles: ArticleRow[] = allArticles ?? [];
  const views = pageViews ?? [];

  // ── 2. Compute summary stats ──────────────────────────────────────────────
  const totalViews = articles.reduce((sum, a) => sum + (a.views ?? 0), 0);

  const startOfThisMonth = startOfMonth(now);
  const articlesThisMonth = articles.filter(
    (a) => new Date(a.created_at) >= startOfThisMonth
  ).length;

  // ── 3. Views per day (last 30 days) ──────────────────────────────────────
  const dayBuckets: DayBucket[] = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date: dateStr,
      label: format(date, "d MMM", { locale: es }),
      count: 0,
    };
  });

  const dayMap = new Map(dayBuckets.map((b) => [b.date, b]));
  for (const v of views) {
    const dateStr = v.viewed_at.slice(0, 10);
    const bucket = dayMap.get(dateStr);
    if (bucket) bucket.count += 1;
  }

  const maxDayCount = Math.max(...dayBuckets.map((b) => b.count), 1);

  // ── 4. Traffic sources ───────────────────────────────────────────────────
  const sourceMap = new Map<string, number>();
  for (const v of views) {
    const src = v.referrer_source || "direct";
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
  }

  const sourceCounts: SourceCount[] = Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      color: SOURCE_CONFIG[source]?.color ?? "#9CA3AF",
      label: SOURCE_CONFIG[source]?.label ?? source,
    }))
    .sort((a, b) => b.count - a.count);

  const totalSourceViews = sourceCounts.reduce((sum, s) => sum + s.count, 0) || 1;

  // ── 5. Top 10 most-read articles ─────────────────────────────────────────
  const top10 = [...articles]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 10);

  const maxViews = top10[0]?.views ?? 1;

  // ── 6. Articles per category ─────────────────────────────────────────────
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

  // ── 7. Articles published per month (last 6 months) ──────────────────────
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

  // ── 8. Render ────────────────────────────────────────────────────────────
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

        {/* ── Views: today / yesterday / week ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-4 text-center">
            <p className="text-xs text-muted">Hoy</p>
            <p className="text-2xl font-bold text-primary tabular-nums mt-1">
              {(viewsToday ?? 0).toLocaleString("es-AR")}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-4 text-center">
            <p className="text-xs text-muted">Ayer</p>
            <p className="text-2xl font-bold text-heading tabular-nums mt-1">
              {(viewsYesterday ?? 0).toLocaleString("es-AR")}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-4 text-center">
            <p className="text-xs text-muted">Últimos 7 días</p>
            <p className="text-2xl font-bold text-heading tabular-nums mt-1">
              {(viewsWeek ?? 0).toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* ── Views per day chart (last 30 days) ── */}
        <section className="bg-white rounded-xl border border-surface-border shadow-sm">
          <div className="px-6 py-4 border-b border-surface-border">
            <h3 className="font-semibold text-heading text-base">
              Vistas por día (últimos 30 días)
            </h3>
          </div>

          <div className="px-4 md:px-6 py-6 overflow-x-auto">
            <div className="flex items-end gap-[3px] min-w-[600px]" style={{ height: 180 }}>
              {dayBuckets.map((bucket, i) => {
                const heightPct =
                  maxDayCount > 0
                    ? Math.round((bucket.count / maxDayCount) * 100)
                    : 0;
                const showLabel = i % 5 === 0 || i === dayBuckets.length - 1;
                return (
                  <div
                    key={bucket.date}
                    className="flex flex-col items-center flex-1 min-w-0"
                    title={`${bucket.label}: ${bucket.count} vistas`}
                  >
                    <div className="w-full flex items-end" style={{ height: 150 }}>
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${Math.max(heightPct, bucket.count > 0 ? 3 : 0)}%`,
                          backgroundColor: "#E30613",
                          opacity: heightPct > 0 ? 0.6 + (heightPct / 100) * 0.4 : 0.1,
                        }}
                      />
                    </div>
                    {showLabel && (
                      <span className="text-[10px] text-muted mt-1 whitespace-nowrap">
                        {bucket.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Traffic sources + Top 10 side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Fuentes de tráfico */}
          <section className="bg-white rounded-xl border border-surface-border shadow-sm">
            <div className="px-6 py-4 border-b border-surface-border">
              <h3 className="font-semibold text-heading text-base">
                Fuentes de tráfico (30 días)
              </h3>
            </div>

            {sourceCounts.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted">
                Todavía no hay datos de tráfico.
              </p>
            ) : (
              <div className="px-6 py-4 space-y-3">
                {sourceCounts.map((src) => {
                  const pct = Math.round((src.count / totalSourceViews) * 100);
                  return (
                    <div key={src.source}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: src.color }}
                          />
                          <span className="text-sm text-heading">{src.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{pct}%</span>
                          <span className="text-sm font-semibold text-muted tabular-nums">
                            {src.count.toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: src.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Top 10 most-read */}
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
        </div>

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
