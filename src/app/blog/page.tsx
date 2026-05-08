import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog/queries";

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts(30);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold">News & Blog</h1>
        <p className="mt-2 text-foreground/70">
          Tech updates, India Post news, and practical guides.
        </p>
      </header>

      <section className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="ui-modal-shell block p-5 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-foreground/70">{post.excerpt}</p>
                )}
                <div className="mt-3 text-xs text-foreground/60">
                  {post.category?.name ? post.category.name : "General"}
                </div>
              </div>
              <div className="text-xs text-foreground/60">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : ""}
              </div>
            </div>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="ui-modal-shell p-6 text-foreground/70">No posts yet.</div>
        )}
      </section>
    </main>
  );
}
