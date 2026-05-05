"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function PersonalizedHeroGreeting() {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/greeting")
      .then((r) => r.json())
      .then((d) => { if (d.greeting) setGreeting(d.greeting); })
      .catch(() => {});
  }, []);

  if (!greeting) return null;

  return (
    <Link
      href="/inquiry?type=quick"
      className="inline-block mt-1 rounded-full border border-brand-green-primary/30 bg-brand-green-primary/5 px-4 py-1.5 text-sm text-brand-green-primary hover:bg-brand-green-primary/10 transition-colors"
    >
      {greeting}
    </Link>
  );
}
