import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";
import ArticleForm from "@/components/admin/ArticleForm";
import type { Tag } from "@/types";

export default async function EditarNoticiaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: article }, { data: allTags }, { data: articleTagRows }] =
    await Promise.all([
      supabase.from("articles").select("*").eq("id", params.id).single(),
      supabase.from("tags").select("*").order("name"),
      supabase
        .from("article_tags")
        .select("tag_id")
        .eq("article_id", params.id),
    ]);

  if (!article) {
    notFound();
  }

  const selectedTagIds = (articleTagRows ?? []).map(
    (row: { tag_id: string }) => row.tag_id
  );

  return (
    <div>
      <AdminHeader title="Editar noticia" />
      <ArticleForm
        article={article}
        allTags={(allTags as Tag[]) ?? []}
        selectedTagIds={selectedTagIds}
      />
    </div>
  );
}
