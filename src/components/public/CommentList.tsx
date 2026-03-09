import { createClient } from "@/lib/supabase/server";
import { smartDate } from "@/lib/utils";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

// Genera un color de fondo determinista a partir del nombre del autor
function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface CommentListProps {
  articleId: string;
}

export default async function CommentList({ articleId }: CommentListProps) {
  const supabase = createClient();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at")
    .eq("article_id", articleId)
    .eq("approved", true)
    .order("created_at", { ascending: true })
    .returns<Comment[]>();

  const list = comments ?? [];

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        {list.length === 0
          ? "No hay comentarios aún."
          : list.length === 1
          ? "1 comentario"
          : `${list.length} comentarios`}
      </p>

      {list.length > 0 && (
        <div className="space-y-4">
          {list.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${avatarColor(comment.author_name)}`}
                aria-hidden="true"
              >
                {comment.author_name.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-surface rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-heading">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-muted">
                      {smartDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-body whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
