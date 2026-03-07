import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function EditarNoticiaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <div>
      <AdminHeader title="Editar noticia" />
      <ArticleForm article={article} />
    </div>
  );
}
