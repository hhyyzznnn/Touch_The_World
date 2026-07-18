import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // CompanyNews slug 정리 (2026-06 이전 랜덤 ID → 정돈된 슬러그)
      { source: "/news/9c58e97d-f25a-4a14-bfe2-f79c27a73f92", destination: "/news/cardnews_fukuoka_culinary_field_trip_2026",         permanent: true },
      { source: "/news/82b1f0b1-444f-4594-a95f-5ac4d1fb307b", destination: "/news/cardnews_fukuoka_specialized_highschool_trip_2026", permanent: true },
      { source: "/news/138f6429-2c4c-4e88-ace4-a02c9c34f71c", destination: "/news/cardnews_waego_book_2026",                          permanent: true },
      { source: "/news/cmq7ohg8x0001pnsb4qe9p1yl",            destination: "/news/cardnews_aso_popculture_webtoon_japan_2026",        permanent: true },
      { source: "/news/cmq7ofyqo0000pnsbj9wokakx",            destination: "/news/cardnews_seo_seoul_science_fukuoka_2026",           permanent: true },
      { source: "/news/cmq5zzlqs0000iej77nmeb3aa",            destination: "/news/cardnews_pocheon_bus_subsidy_2026",                 permanent: true },
      { source: "/news/cmpdoajsg0001oincbqdeeza3",            destination: "/news/cardnews_incheon_jeonju_industrial_trip_2026",      permanent: true },
      { source: "/news/cmpdoaesb0000oinckizu0kpy",            destination: "/news/cardnews_inspire_resort_teacher_training_2026",     permanent: true },
      { source: "/news/cmpbafcsw0002t3wj2cs82mb8",            destination: "/news/cardnews_specialized_highschool_japan_global_2026", permanent: true },
      { source: "/news/cmpbaf6yy0001t3wjfh72ve6b",            destination: "/news/cardnews_foreign_language_highschool_osaka_2026",   permanent: true },
      { source: "/news/cmpbaeyjw0000t3wjswjl7ic3",            destination: "/news/cardnews_japan_osaka_nara_kyoto_5days_2026",        permanent: true },
      { source: "/news/cmokvfvmh0000mdlx188byj4v",            destination: "/news/cardnews_ai_student_startup_edu_trip_2026",        permanent: true },
      { source: "/news/cmokveqm6000011nxdyav825m",            destination: "/news/cardnews_jeonbuk_industrial_incheon_trip_2026",    permanent: true },
      { source: "/news/cmogpj4uf0000ik8og9mtyigl",            destination: "/news/cardnews_day_trip_no_overnight_2026",              permanent: true },
      { source: "/news/cmo2x1a2b00007jwk5ky4eo3t",            destination: "/news/cardnews_touchtheworld_9_differentiators",         permanent: true },
      { source: "/news/cmnsz4sos0000a2c1w3xtwof3",            destination: "/news/cardnews_ceo_introduction",                        permanent: true },
      { source: "/news/cmn9nxtii00041fdbmtijmmcc",            destination: "/news/cardnews_specialized_highschool_future_talent_2026", permanent: true },
      { source: "/news/cmn9nx6sv00031fdbjuq07tbr",            destination: "/news/cardnews_specialized_highschool_career_program",   permanent: true },
      { source: "/news/cmn9nwop200021fdbfhzjqmnp",            destination: "/news/cardnews_overseas_employment_study_abroad",        permanent: true },
      { source: "/news/cmn9nw4e300011fdbrgkwo4ja",            destination: "/news/cardnews_teacher_training_program",                permanent: true },
      { source: "/news/cmn9nvl8d00001fdbtcdwux7t",            destination: "/news/cardnews_overseas_edu_trip_program",               permanent: true },
      { source: "/news/cmn64a5tb0002duplnapkhglw",            destination: "/news/cardnews_company_introduction_2026",               permanent: true },
      { source: "/news/cmn649bph0001dupl5pb5j5o2",            destination: "/news/cardnews_programs_introduction_2026",              permanent: true },
      { source: "/news/cmn648q9p0000duplif3b6tne",            destination: "/news/cardnews_japan_recommended_edu_trip_2026",         permanent: true },
      { source: "/news/cmn02jdnw0001105zn7xmk6fn",            destination: "/news/cardnews_incheon_edu_trip_support_2026",           permanent: true },
      { source: "/news/cmn02imuz0000105zfbc12uj9",            destination: "/news/cardnews_inspire_resort_edu_trip_2026",            permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "**.utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "ufs.sh", pathname: "/**" },
      { protocol: "https", hostname: "**.ufs.sh", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "mblogthumb-phinf.pstatic.net", pathname: "/**" },
      { protocol: "https", hostname: "**.pstatic.net", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  // 번들 크기 최적화
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;
