from app.knowledge import readme as rd


def test_split_sections_and_anchors(sample_readme):
    sections = rd.split_sections(sample_readme)
    titles = [s.title for s in sections]
    assert titles[0] == ""  # preamble
    assert "Sample Project" in titles
    anchors = [s.anchor for s in sections]
    assert "features" in anchors and "features-1" in anchors  # duplicate heading suffixed
    assert "what-is-not-implemented" in anchors
    assert "tech-stack" in anchors
    # The '#' line inside the code fence is not a heading.
    assert not any("fence" in a for a in anchors)
    kinds = {s.anchor: s.kind for s in sections}
    assert kinds["features"] == "features"
    assert kinds["architecture"] == "architecture"
    assert kinds["what-is-not-implemented"] == "planned"
    assert kinds["tech-stack"] == "stack"


def test_github_anchor():
    assert rd.github_anchor("What is not implemented") == "what-is-not-implemented"
    assert rd.github_anchor("API / Endpoints") == "api--endpoints"
    assert rd.github_anchor("`code` and **bold**") == "code-and-bold"
    assert rd.github_anchor("🌌 Overview") == "overview"


def test_overview_features_planned(sample_readme):
    sections = rd.split_sections(sample_readme)
    overview = rd.extract_overview(sections)
    assert overview is not None
    text, anchor = overview
    assert text.startswith("Sample Project is a document pipeline")
    assert anchor == "sample-project"
    features = rd.extract_features(sections)
    assert ("Human approval before any quotation reaches the client", "features") in features
    assert any(a == "features-1" for _, a in features)
    planned = rd.extract_planned(sections)
    assert [p for p, _ in planned] == ["Client ACCEPT / REJECT handling", "Sea freight pricing"]


def test_technologies_from_badges_stack_and_prose(sample_readme):
    sections = rd.split_sections(sample_readme)
    techs = rd.extract_technologies(sample_readme, sections)
    for name in ("FastAPI", "Node.js", "Redis", "Playwright", "pytest", "Python"):
        assert name in techs, name
        assert techs[name].status == "implemented"
    # "RQ" is only mentioned in feature prose; short ambiguous names need a badge or stack listing.
    assert "RQ" not in techs
    assert "badges" in techs["Node.js"].anchors and techs["Node.js"].explicit
    assert "tech-stack" in techs["FastAPI"].anchors and techs["FastAPI"].explicit
    assert techs["Playwright"].confidence >= 0.8  # architecture prose
    assert "MIT" not in techs and "License" not in techs


def test_ambiguous_english_words_in_prose_are_not_technologies():
    md = (
        "# T\n\n## Overview\nWe render the page, express the idea, go to the node and pick neon colours "
        "with a stripe pattern; the rest of the flow uses java-style naming on android.\n\n"
        "## Roadmap\n- Add Redis caching\n- Move the worker to Celery\n"
    )
    techs = rd.extract_technologies(md, rd.split_sections(md))
    for bad in ("Render", "Express", "Node.js", "Neon", "Stripe", "Go", "REST", "Java", "Android", "Celery"):
        assert bad not in techs, bad
    assert techs["Redis"].status == "planned" and techs["Redis"].anchors == ["roadmap"]


def test_ambiguous_names_count_in_badges_and_stack_lists():
    md = (
        "# T\n\n![Express](https://img.shields.io/badge/Express-000)\n![](https://img.shields.io/badge/Render-46E3B7)\n\n"
        "## Tech Stack\n- **Backend:** Node.js, Express and Mongoose\n- **Hosting:** Railway\n"
    )
    techs = rd.extract_technologies(md, rd.split_sections(md))
    for name in ("Express", "Render", "Node.js", "Mongoose", "Railway"):
        assert techs[name].status == "implemented" and techs[name].explicit, name


def test_planned_mention_is_overridden_by_a_real_one():
    md = "# T\n\n## Architecture\nJobs run on Redis.\n\n## Roadmap\n- Cluster Redis\n"
    techs = rd.extract_technologies(md, rd.split_sections(md))
    assert techs["Redis"].status == "implemented" and set(techs["Redis"].anchors) == {"architecture", "roadmap"}


def test_short_ambiguous_names_are_case_sensitive():
    sections = rd.split_sections("# T\n\n## Tech Stack\n- We go to the rest of the queue with rq.\n")
    techs = rd.extract_technologies("", sections)
    assert "Go" not in techs and "REST" not in techs and "RQ" not in techs


def test_instruction_text_is_only_text(sample_readme):
    sections = rd.split_sections(sample_readme)
    last = sections[-1]
    assert "ignore all previous instructions" in last.body
    # Nothing in the extractor treats it as anything but prose: no feature, no tech.
    assert all("ignore all previous" not in f for f, _ in rd.extract_features(sections))


def test_auralis_fixture_is_processable(auralis_readme):
    sections = rd.split_sections(auralis_readme)
    assert len(sections) > 5
    techs = rd.extract_technologies(auralis_readme, sections)
    assert techs["FastAPI"].status == "implemented" and techs["LangGraph"].status == "implemented"
    assert rd.extract_overview(sections) is not None


def test_canonical_tech_aliases():
    assert rd.canonical_tech("Node") == "Node.js"
    assert rd.canonical_tech("postgres") == "PostgreSQL"
    assert rd.canonical_tech("Tailwind") == "Tailwind CSS"
    assert rd.canonical_tech("something else") is None


def test_token_overlap_and_slug_key():
    assert rd.token_overlap("RAG over PDF, CSV and Markdown", "RAG over PDF CSV Markdown files") > 0.5
    assert rd.slug_key("7 objection classes, 5 personas!") == "7-objection-classes-5-personas"
