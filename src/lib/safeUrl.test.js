import { describe, expect, it } from "vitest"
import { safeHref, safeImageSrc } from "./safeUrl"

const BASE = "https://github.com/aayush2724/Example/blob/HEAD/"
const RAW = "https://raw.githubusercontent.com/aayush2724/Example/HEAD/"

describe("safeHref", () => {
  it("keeps absolute http(s) and mailto links", () => {
    expect(safeHref("https://example.com/x?y=1", BASE)).toBe("https://example.com/x?y=1")
    expect(safeHref("http://example.com", BASE)).toBe("http://example.com/")
    expect(safeHref("mailto:hi@example.com", BASE)).toBe("mailto:hi@example.com")
  })

  it("resolves README-relative links against the repository", () => {
    expect(safeHref("docs/setup.md", BASE)).toBe(`${BASE}docs/setup.md`)
    expect(safeHref("./LICENSE", BASE)).toBe(`${BASE}LICENSE`)
    expect(safeHref("#usage", BASE)).toBe("#usage")
  })

  it("rejects script-bearing and unknown protocols", () => {
    expect(safeHref("javascript:alert(1)", BASE)).toBeNull()
    expect(safeHref("JAVASCRIPT:alert(1)", BASE)).toBeNull()
    expect(safeHref("  javascript:alert(1)", BASE)).toBeNull()
    expect(safeHref("data:text/html;base64,PHNjcmlwdD4=", BASE)).toBeNull()
    expect(safeHref("vbscript:msgbox", BASE)).toBeNull()
    expect(safeHref("", BASE)).toBeNull()
    expect(safeHref(undefined, BASE)).toBeNull()
  })
})

describe("safeImageSrc", () => {
  it("allows http(s) and base64 raster data URIs", () => {
    expect(safeImageSrc("https://img.shields.io/badge/x-y-z", RAW)).toBe("https://img.shields.io/badge/x-y-z")
    expect(safeImageSrc("data:image/png;base64,iVBORw0KGgo=", RAW)).toBe("data:image/png;base64,iVBORw0KGgo=")
  })

  it("resolves relative images against the raw file host", () => {
    expect(safeImageSrc("assets/demo.gif", RAW)).toBe(`${RAW}assets/demo.gif`)
  })

  it("rejects everything else", () => {
    expect(safeImageSrc("javascript:alert(1)", RAW)).toBeNull()
    expect(safeImageSrc("data:text/html,<b>x</b>", RAW)).toBeNull()
    expect(safeImageSrc("data:image/svg+xml;base64,PHN2Zz4=", RAW)).toBeNull()
    expect(safeImageSrc("mailto:x@y.z", RAW)).toBeNull()
  })
})
