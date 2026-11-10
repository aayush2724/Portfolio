import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { renderMarkdown } from "./GithubReadme"

const html = (md, ctx) => renderToStaticMarkup(<>{renderMarkdown(md, ctx)}</>)
const assistantCtx = { base: "https://aayush-2724.vercel.app/", images: false, linkHosts: ["github.com", "aayush-2724.vercel.app"], headingShift: 2 }

describe("renderMarkdown for assistant replies", () => {
  it("drops images and off-list links, keeps evidence links, fragments and mailto", () => {
    const md =
      "Uses LangGraph [S1]. ![pixel](https://evil.example/p.png) [repo](https://github.com/aayush2724/Auralis) " +
      "[bad](https://evil.example/x) [sub](https://api.github.com/x) [mail](mailto:aayush2615@gmail.com) [here](#sources)"
    const out = html(md, assistantCtx)
    expect(out).not.toContain("<img")
    expect(out).not.toContain("evil.example")
    expect(out).toContain('href="https://github.com/aayush2724/Auralis"')
    expect(out).toContain('href="https://api.github.com/x"') // subdomain of an allowed host
    expect(out).toContain('href="mailto:aayush2615@gmail.com"')
    expect(out).toContain('href="#sources"')
    expect(out).toContain("bad") // the label survives as text
    expect(out).toContain("[S1]") // citations are plain text for the Sources list
  })

  it("renders a linked badge as its alt text only when images are off", () => {
    const out = html("[![Node.js](https://img.shields.io/badge/Node.js-339933)](https://nodejs.org)", assistantCtx)
    expect(out).not.toContain("<img")
    expect(out).not.toContain("nodejs.org") // off-list link dropped, text kept
    expect(out).toContain("Node.js")
  })

  it("still renders images and any safe link for READMEs", () => {
    const out = html("![a](https://raw.githubusercontent.com/x/y/HEAD/a.png) [docs](https://example.com/docs)", { owner: "x", repo: "y" })
    expect(out).toContain("<img")
    expect(out).toContain('href="https://example.com/docs"')
  })

  it("keeps a <pre> banner's lines instead of reflowing them into prose", () => {
    const md = '<div align="center">\n\n<pre>\n █████╗ ██╗\n██╔══██╗██║\n</pre>\n\n### Title'
    const out = html(md, { owner: "x", repo: "y" })
    expect(out).toContain("<pre")
    expect(out).toContain(" █████╗ ██╗\n██╔══██╗██║")
    expect(out).not.toContain(">pre<") // the fence marker is not shown as a language label
  })

  it("article mode: anchors headings GitHub-style and drops badge walls, keeps real images", () => {
    const md =
      "## 🏗️ Architecture\n\n[![CI](https://img.shields.io/badge/ci-passing-green)](https://x.y) ![shot](docs/a.png)"
    const out = html(md, { owner: "x", repo: "y", anchors: true, badges: false })
    expect(out).toContain('id="readme--architecture"') // matches a README's own "#-architecture" link
    expect(out).not.toContain("shields.io")
    expect(out).toContain("<img") // the screenshot survives
  })
})

