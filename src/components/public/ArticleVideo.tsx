"use client";

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

interface ArticleVideoProps {
  videoUrl: string;
  title: string;
}

export default function ArticleVideo({ videoUrl, title }: ArticleVideoProps) {
  const youtubeId = getYouTubeId(videoUrl);

  return (
    <div className="rounded-none sm:rounded-xl md:rounded-2xl overflow-hidden -mx-4 sm:mx-0 shadow-card bg-black">
      {youtubeId ? (
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative aspect-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            controls
            className="w-full h-full object-contain"
            src={videoUrl}
            preload="metadata"
          />
        </div>
      )}
    </div>
  );
}
