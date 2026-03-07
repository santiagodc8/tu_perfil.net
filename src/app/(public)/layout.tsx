import { createClient } from "@/lib/supabase/server";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import type { Category } from "@/types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  const cats: Category[] = categories ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header categories={cats} />
      <main className="flex-1">{children}</main>
      <Footer categories={cats} />
    </div>
  );
}
