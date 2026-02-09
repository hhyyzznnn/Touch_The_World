import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  link: string | null;
  isPinned: boolean;
  createdAt?: Date;
}

export function NewsTicker({ items }: { items: NewsItem[] }) {
  const item = items[0];
  if (!item) return null;

  const href = item.link?.trim() || `/news/${item.id}`;
  const isExternal = !!item.link?.trim()?.startsWith("http");

  return (
    <section className="bg-brand-green-primary/10 border-y border-brand-green-primary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
          <span className="text-text-gray font-medium shrink-0">회사 소식</span>
          <span className="text-gray-300" aria-hidden>|</span>
          <Link
            href={href}
            className="inline-flex items-center gap-2 hover:underline underline-offset-2 transition"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
          >
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-bold bg-brand-green-primary text-white shrink-0">
              NEW
            </span>
            <span className="text-text-dark">{item.title}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
