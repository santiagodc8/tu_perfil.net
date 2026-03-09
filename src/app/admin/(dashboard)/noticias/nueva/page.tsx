import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";
import ArticleForm from "@/components/admin/ArticleForm";
import type { Tag } from "@/types";

export default async function NuevaNoticiaPage() {
  const supabase = createClient();
  const { data: allTags } = await supabase.from("tags").select("*").order("name");

  return (
    <div>
      <AdminHeader title="Nueva noticia" />
      <ArticleForm allTags={(allTags as Tag[]) ?? []} selectedTagIds={[]} />
    </div>
  );
}
