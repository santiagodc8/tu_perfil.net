import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  function getHref(page: number) {
    return page === 1 ? basePath : `${basePath}?pagina=${page}`;
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Paginación">
      {currentPage > 1 && (
        <Link
          href={getHref(currentPage - 1)}
          className="px-3 py-2 text-sm text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition"
        >
          Anterior
        </Link>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getHref(page)}
            className={`px-3 py-2 text-sm rounded-lg transition ${
              page === currentPage
                ? "bg-primary text-white font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-primary"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={getHref(currentPage + 1)}
          className="px-3 py-2 text-sm text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition"
        >
          Siguiente
        </Link>
      )}
    </nav>
  );
}
