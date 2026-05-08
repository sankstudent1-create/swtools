import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog/queries";

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts(30);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-sky/10 to-transparent" />
        <h1 className="text-4xl font-bold">News & Blog</h1>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Tech updates, India Post news, and practical guides. Read quick updates and share with your friends.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {posts.map((post) => {
          const publishedLabel = post.published_at
            ? new Date(post.published_at).toLocaleDateString()
            : "";

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group ui-modal-shell block overflow-hidden p-0 hover:bg-white/5"
            >
              {post.cover_image_url && (
                <div className="relative">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                    {post.category?.name ? post.category.name : "General"}
                  </span>
                  <span className="text-xs text-foreground/60">{publishedLabel}</span>
                </div>

                <h2 className="mt-4 text-xl font-semibold group-hover:underline">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/70">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          );
        })}

        {posts.length === 0 && (
          <div className="ui-modal-shell p-6 text-foreground/70">No posts yet.</div>
        )}
      </section>
    </main>
  );
}
