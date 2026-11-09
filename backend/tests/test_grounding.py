from app.assistant.evidence import EvidencePack, PackedItem
from app.assistant.grounding import ground
from app.assistant.tools import EvidenceItem


def _pack():
    pack = EvidencePack()
    pack.items.append(
        PackedItem(
            "S1",
            EvidenceItem(
                url="https://github.com/aayush2724/Auralis/blob/abc/README.md#architecture",
                text="arch",
                title="Architecture",
                kind="readme",
                project_name="Auralis",
            ),
        )
    )
    pack.items.append(
        PackedItem(
            "S2",
            EvidenceItem(
                url="https://auralis-client-five.vercel.app",
                text="demo",
                title="Demo",
                kind="project",
                project_name="Auralis",
            ),
        )
    )
    return pack


def test_images_and_foreign_links_are_removed_but_evidence_links_survive():
    text = (
        "Auralis uses a LangGraph pipeline [S1]. ![pixel](https://evil.example/t.png) See the "
        "[repo](https://github.com/aayush2724/Auralis) and the [demo](https://auralis-client-five.vercel.app) "
        "but not [this](https://evil.example/phish) or https://evil.example/x. Bogus cite [S9]. <img src=x>"
    )
    g = ground(text, _pack())
    assert "evil.example" not in g.text and "<img" not in g.text
    assert "[repo](https://github.com/aayush2724/Auralis)" in g.text  # github.com is always allowed
    assert "[demo](https://auralis-client-five.vercel.app)" in g.text  # host present in the evidence
    assert "this" in g.text and "[S9]" not in g.text and "[S1]" in g.text
    assert g.cited == ["S1"] and g.dropped == 5


def test_sources_prefer_cited_items_then_the_rest():
    pack = _pack()
    sources = pack.sources(["S2"])
    assert [s.id for s in sources] == ["S2", "S1"]
    assert "auralis-client-five.vercel.app" in pack.link_hosts() and "github.com" in pack.link_hosts()


def test_grouped_citations_are_split_and_checked_individually():
    g = ground("Uses FAISS [S1, S2] and Redis [S2; S9].", _pack())
    assert "[S1][S2]" in g.text and "[S9]" not in g.text and "[S2]" in g.text
    assert g.cited == ["S1", "S2"] and g.dropped == 1
