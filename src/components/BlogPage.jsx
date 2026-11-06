import { useEffect } from "react"
import { renderMarkdown } from "./GithubReadme"
import { MD_CTX, RouteLink } from "./NowSection"
import { POSTS, getPost } from "../data/posts"
import { formatDate } from "../data/content"

const HOME_TITLE = "Aayush Kumar — Full-Stack Developer & CS Student"

/**
 * The blog, served at #/blog (index) and #/blog/:slug (post). Hash routes
 * share one document, so the title and description are swapped per page
 * and restored on the way out, the same as the case-study pages.
 */
export default function BlogPage({ slug, onBack }) {
  const post = slug ? getPost(slug) : null

  useEffect(() => {
    const desc = document.querySelector('meta[name="description"]')
    const originalDesc = desc?.getAttribute("content")
    if (post) {
      document.title = `${post.title} — Aayush Kumar`
      desc?.setAttribute("content", post.summary || `${post.title}, a short post by Aayush Kumar.`)
    } else if (slug) {
      document.title = "Post not found — Aayush Kumar"
    } else {
      document.title = "Blog — Aayush Kumar"
      desc?.setAttribute("content", "Short posts by Aayush Kumar on building this portfolio, music, and the things he's learning.")
    }
    return () => {
      document.title = HOME_TITLE
      if (desc && originalDesc != null) desc.setAttribute("content", originalDesc)
    }
  }, [post, slug])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const Bar = ({ children }) => (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest">
      {children}
      <button onClick={onBack} className="transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>
        ← back to portfolio
      </button>
    </div>
  )

  if (slug && !post) {
    return (
      <main id="main" tabIndex={-1} className="relative z-10 mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-28 outline-none">
        <Bar>
          <RouteLink to="#/blog" className="transition-colors hover:text-[var(--accent)]">
            <span style={{ color: "var(--muted)" }}>← all posts</span>
          </RouteLink>
        </Bar>
        <p className="font-mono text-sm" style={{ color: "var(--muted)" }}>
          $ cat blog/{slug}.md
          <br />
          cat: no such post
        </p>
        <h1 className="mt-4 font-display text-4xl uppercase leading-tight md:text-6xl">Post not found</h1>
        <PostList />
      </main>
    )
  }

  if (!post) {
    return (
      <main id="main" tabIndex={-1} className="relative z-10 mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-28 outline-none">
        <Bar>
          <span style={{ color: "var(--accent)" }}>$ ls blog/</span>
        </Bar>
        <p className="mb-3 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--accent)" }}>
          Short posts
        </p>
        <h1 className="font-display text-5xl uppercase leading-none md:text-7xl">Blog</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: "var(--muted)" }}>
          Notes on building this site, music, and whatever I'm learning. Short on purpose.
        </p>
        <PostList />
      </main>
    )
  }

  return (
    <main id="main" tabIndex={-1} className="relative z-10 mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-28 outline-none">
      <Bar>
        <RouteLink to="#/blog" className="transition-colors hover:text-[var(--accent)]">
          <span style={{ color: "var(--muted)" }}>← all posts</span>
        </RouteLink>
      </Bar>
      <article>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          {formatDate(post.date)} · {post.minutes} min read
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-tight md:text-6xl">{post.title}</h1>
        {post.summary && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
            {post.summary}
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t} className="rounded-full border border-[var(--line)] px-3 py-1 font-mono text-xs" style={{ color: "var(--muted)" }}>
                {t}
              </li>
            ))}
          </ul>
        )}
        <div className="blog-body mt-10 border-t border-[var(--line)] pt-8">{renderMarkdown(post.body, MD_CTX)}</div>
      </article>
      <PostList heading="More posts" exclude={post.slug} />
    </main>
  )
}

function PostList({ heading, exclude }) {
  const posts = POSTS.filter((p) => p.slug !== exclude)
  if (!posts.length) return null
  return (
    <section className="mt-14" aria-label={heading || "Posts"}>
      {heading && (
        <h2 className="mb-2 font-display text-2xl uppercase" style={{ color: "var(--fg)" }}>
          {heading}
        </h2>
      )}
      <ol className="divide-y divide-[var(--line)]">
        {posts.map((p) => (
          <li key={p.slug}>
            <RouteLink to={`#/blog/${p.slug}`} className="group flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:gap-6">
              <span className="flex-shrink-0 font-mono text-xs md:w-28" style={{ color: "var(--muted)" }}>
                {formatDate(p.date)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl transition-colors group-hover:text-[var(--accent)]" style={{ color: "var(--fg)" }}>
                  {p.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {p.summary}
                </span>
                {p.tags.length > 0 && (
                  <span className="mt-2 block font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    {p.tags.join(" · ")}
                  </span>
                )}
              </span>
              <span className="font-mono text-xs" style={{ color: "var(--muted)" }}>
                {p.minutes} min
              </span>
            </RouteLink>
          </li>
        ))}
      </ol>
    </section>
  )
}
