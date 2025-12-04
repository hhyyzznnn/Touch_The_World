import Link from "next/link";
import { Bus, Mountain, Plane, Briefcase, GraduationCap, Globe } from "lucide-react";
import { Logo } from "./Logo";

const categories = [
  { name: "수학여행", icon: Bus, href: "/programs?category=수학여행" },
  { name: "수련활동", icon: Mountain, href: "/programs?category=수련활동" },
  { name: "해외탐방", icon: Plane, href: "/programs?category=해외탐방" },
  { name: "진로체험", icon: Briefcase, href: "/programs?category=진로체험" },
  { name: "교사연수", icon: GraduationCap, href: "/programs?category=교사연수" },
  { name: "유학프로그램", icon: Globe, href: "/programs?category=유학프로그램" },
];

export function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Logo />
          <nav className="hidden xl:flex items-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex items-center gap-1.5 text-text-gray hover:text-brand-green transition font-medium text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{category.name}</span>
                </Link>
              );
            })}
          </nav>
          <nav className="xl:hidden flex items-center gap-2">
            <Link
              href="/programs"
              className="text-text-gray hover:text-brand-green transition font-medium text-sm px-3 py-2"
            >
              프로그램
            </Link>
            <Link
              href="/events"
              className="text-text-gray hover:text-brand-green transition font-medium text-sm px-3 py-2"
            >
              행사
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

