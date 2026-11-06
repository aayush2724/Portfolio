/**
 * The site's own markdown, read at build time. Add a post by dropping a
 * `YYYY-MM-DD-slug.md` with frontmatter into src/content/posts; edit
 * src/content/now.md to update the Now section. No CMS, no runtime fetch.
 */
import { buildPosts, parseNow } from "./content"
import nowRaw from "../content/now.md?raw"

const modules = import.meta.glob("../content/posts/*.md", { query: "?raw", import: "default", eager: true })

export const POSTS = buildPosts(modules)
export const getPost = (slug) => POSTS.find((p) => p.slug === slug) || null
export const NOW = parseNow(nowRaw)
