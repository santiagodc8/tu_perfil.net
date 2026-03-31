'use client';

import React from 'react';
import Link from 'next/link';
import { LazyImage } from './lazy-image';
import { smartDateShort } from '@/lib/utils';

interface BlogArticle {
    title: string;
    slug: string;
    excerpt?: string;
    image_url: string | null;
    created_at: string;
    author_name?: string;
    readTime?: string | null;
    category: { name: string; color: string; slug: string } | null;
}

interface BlogSectionProps {
    articles: BlogArticle[];
    title?: string;
    description?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=640&h=360&fit=crop';

export function BlogSection({ articles, title = 'Últimas Noticias', description = 'Las noticias más recientes de tu región y el mundo.' }: BlogSectionProps) {
    return (
        <div className="mx-auto w-full max-w-5xl grow">
            <div className="space-y-1 px-4 py-8">
                <h2 className="font-display text-display-md sm:text-display-lg tracking-wide text-heading">
                    {title}
                </h2>
                <p className="text-muted text-base">
                    {description}
                </p>
            </div>
            <div className="h-px w-full border-b border-dashed border-surface-border" />
            <div className="grid p-4 md:grid-cols-2 lg:grid-cols-3 z-10 stagger-children">
                {articles.map((article) => (
                    <Link
                        href={`/noticia/${article.slug}`}
                        key={article.slug}
                        className="group flex flex-col gap-2 rounded-lg p-2 transition-[background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-surface active:scale-[0.98] active:bg-gray-100"
                        style={{ transition: 'background-color 150ms cubic-bezier(0.23,1,0.32,1), transform 120ms cubic-bezier(0.23,1,0.32,1)' }}
                    >
                        <div className="relative overflow-hidden rounded-lg">
                            <LazyImage
                                src={article.image_url || FALLBACK_IMAGE}
                                fallback={FALLBACK_IMAGE}
                                inView={true}
                                alt={article.title}
                                ratio={16 / 9}
                                className="transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                            />
                            {article.category && (
                                <span
                                    className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-sm backdrop-blur-[2px] z-10"
                                    style={{ backgroundColor: article.category.color }}
                                >
                                    {article.category.name}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2 px-2 pb-2">
                            <div className="text-muted flex items-center gap-2 text-[11px] sm:text-xs">
                                {article.author_name && (
                                    <>
                                        <p>por {article.author_name}</p>
                                        <div className="bg-muted size-1 rounded-full" />
                                    </>
                                )}
                                <p>{smartDateShort(article.created_at)}</p>
                                {article.readTime && (
                                    <>
                                        <div className="bg-muted size-1 rounded-full" />
                                        <p>{article.readTime}</p>
                                    </>
                                )}
                            </div>
                            <h3 className="line-clamp-2 text-lg leading-5 font-semibold tracking-tight text-heading transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:text-primary">
                                {article.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
