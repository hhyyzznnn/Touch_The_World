"use client";

import Link from "next/link";
import { PROGRAM_CATEGORIES } from "@/lib/constants";
import { trackEvent, GA_EVENTS } from "@/lib/gtag";

function CategoryButton({ category }: { category: (typeof PROGRAM_CATEGORIES)[number] }) {
  const label = category.name.split("\n")[0];
  const Icon = category.icon;
  return (
    <Link
      href={category.href}
      onClick={() => trackEvent(GA_EVENTS.CATEGORY_CLICK, { category: label })}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm text-text-dark hover:border-brand-green-primary hover:text-brand-green-primary transition-colors shadow-sm whitespace-nowrap"
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {label}
    </Link>
  );
}

export function CategoryQuickNav() {
  const topRow = PROGRAM_CATEGORIES.slice(0, 5);
  const bottomRow = PROGRAM_CATEGORIES.slice(5);

  return (
    <div className="max-w-3xl mx-auto space-y-2">
      <div className="flex flex-wrap justify-center gap-2">
        {topRow.map((category) => (
          <CategoryButton key={category.name} category={category} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {bottomRow.map((category) => (
          <CategoryButton key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
