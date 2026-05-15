import { getPostsV3 } from "@/lib/blog-v3/queries";

export async function GET() {
  const posts = await getPostsV3(true);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://swtools.in';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map((post: any) => `
    <url>
      <loc>${siteUrl}/blog/${post.slug}</loc>
      <lastmod>${new Date(post.updated_at || post.published_at || post.created_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
    },
  });
}
