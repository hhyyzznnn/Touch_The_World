import { PrismaClient } from "@prisma/client";
async function main() {
  const p = new PrismaClient();
  const news = await p.companyNews.findMany({ select: { title: true, imageUrl: true, imageUrls: true } });
  const local = news.filter(n =>
    (n.imageUrl ?? "").includes("company-news") ||
    n.imageUrls.some(u => u.includes("company-news"))
  );
  for (const n of local) {
    const localSlides = n.imageUrls.filter(u => u.includes("company-news"));
    console.log(`[${n.title.slice(0, 30)}] thumbnail: ${n.imageUrl?.includes("company-news") ? "✓" : "✗"} | slides: ${localSlides.length}장`);
  }
  await p.$disconnect();
}
main();
