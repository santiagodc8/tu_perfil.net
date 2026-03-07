import ArticleCard from "./ArticleCard";

interface SidebarArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

export default function SidebarPublic({
  popular,
}: {
  popular: SidebarArticle[];
}) {
  return (
    <aside className="space-y-4 sm:space-y-6">
      {/* Busqueda */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-4">
        <h3 className="font-bold text-heading mb-3">Buscar</h3>
        <form action="/buscar" className="flex">
          <input
            name="q"
            type="text"
            placeholder="Buscar noticias..."
            className="flex-1 px-3 py-2.5 border border-surface-border rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary text-white rounded-r-lg text-sm font-medium hover:bg-primary-hover active:bg-primary-dark transition"
          >
            Ir
          </button>
        </form>
      </div>

      {/* Mas leidas */}
      {popular.length > 0 && (
        <div className="bg-surface-card rounded-xl border border-surface-border p-4">
          <h3 className="font-bold text-heading mb-4">Más leídas</h3>
          <div className="space-y-4">
            {popular.map((article, i) => (
              <div key={article.slug} className="flex gap-3 items-start">
                <span className="text-2xl font-extrabold text-surface-border leading-none flex-shrink-0 w-6 text-center">
                  {i + 1}
                </span>
                <ArticleCard {...article} size="small" />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
