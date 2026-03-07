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
    <aside className="space-y-6">
      {/* Busqueda */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-bold text-gray-900 mb-3">Buscar</h3>
        <form action="/buscar" className="flex">
          <input
            name="q"
            type="text"
            placeholder="Buscar noticias..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-r-lg text-sm font-medium hover:bg-accent-dark transition"
          >
            Ir
          </button>
        </form>
      </div>

      {/* Mas leidas */}
      {popular.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Más leídas</h3>
          <div className="space-y-4">
            {popular.map((article, i) => (
              <div key={article.slug} className="flex gap-3 items-start">
                <span className="text-2xl font-extrabold text-gray-200 leading-none flex-shrink-0">
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
