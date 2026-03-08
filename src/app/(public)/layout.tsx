export const revalidate = 60; // Revalidar cada 60s (breaking news necesita ser ágil)

import { createClient } from "@/lib/supabase/server";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import BreakingNewsBanner from "@/components/public/BreakingNewsBanner";
import type { Category, BreakingNews } from "@/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [{ data: categories }, { data: breakingNews }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("breaking_news")
      .select("*")
      .eq("active", true)
      .limit(1)
      .single<BreakingNews>(),
  ]);

  const cats: Category[] = categories ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {breakingNews?.text && (
        <BreakingNewsBanner text={breakingNews.text} link={breakingNews.link} />
      )}
      <Header categories={cats} />
      <main className="flex-1">{children}</main>
      <Footer categories={cats} />
    </div>
  );
}
