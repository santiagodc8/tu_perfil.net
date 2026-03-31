import ArticleCard from "./ArticleCard";

interface RelatedArticle {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  created_at: string;
  category: { name: string; color: string } | null;
}

export default function RelatedArticles({ articles }: { articles: RelatedArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16 pt-8 border-t border-surface-border">
      <h3 className="font-display text-display-sm sm:text-display-md text-heading mb-6">
        Noticias relacionadas
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </div>
    </section>
  );
}
