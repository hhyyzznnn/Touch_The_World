import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-landing-pages";

const page = seoLandingPages["specialized-highschool"];

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.description,
  keywords: page.keywords,
  alternates: {
    canonical: page.path,
  },
  openGraph: {
    title: page.metaTitle,
    description: page.description,
    url: page.path,
    type: "website",
    images: [{ url: page.image }],
  },
};

export default function SpecializedHighschoolPage() {
  return <SeoLandingPage page={page} />;
}
