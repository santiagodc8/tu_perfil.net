import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatDateShort } from "@/lib/utils";

interface RecentArticle {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  category: { name: string; color: string } | null;
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const { count: totalArticles } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthArticles } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, published, created_at, category:categories(name, color)")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<RecentArticle[]>();

  return (
    <div>
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Boton crear noticia */}
        <Link
          href="/admin/noticias/nueva"
          className="block w-full bg-accent hover:bg-accent-dark text-white text-center text-lg font-bold py-4 rounded-xl transition shadow-lg shadow-accent/20"
        >
          + CREAR NUEVA NOTICIA
        </Link>

        {/* Estadisticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500">Total de noticias</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {totalArticles ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500">Noticias este mes</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {monthArticles ?? 0}
            </p>
          </div>
        </div>

        {/* Noticias recientes */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Noticias recientes</h3>
            <Link
              href="/admin/noticias"
              className="text-sm text-accent hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {recentArticles && recentArticles.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentArticles.map((article) => (
                <li key={article.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                        article.published ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/noticias/${article.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-accent truncate block"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {article.category && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: article.category.color }}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDateShort(article.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/admin/noticias/${article.id}`}
                    className="text-sm text-gray-400 hover:text-accent ml-4 flex-shrink-0"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-gray-400">
              No hay noticias todavía. ¡Crea la primera!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
