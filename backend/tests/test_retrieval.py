from sqlalchemy import select

from app.db.models import FactStatus, FactType, Project, ProjectStatus
from app.knowledge import retrieval
from app.knowledge.ingest import ingest_readme
from app.knowledge.seed import seed_all
from tests.conftest import mock_repo


async def test_search_ranks_the_langgraph_project_first(db, seed_data):
    await seed_all(db, seed_data)
    hits = await retrieval.search_projects(db, "LangGraph agent objection classifier")
    assert hits and hits[0].project.slug == "auralis"
    assert hits[0].matched and all(f.evidence for f in hits[0].matched)
    assert await retrieval.search_projects(db, "   ") == []


async def test_get_project_and_fact_filters(db, seed_data):
    await seed_all(db, seed_data)
    detail = await retrieval.get_project(db, "auralis")
    assert detail is not None and "technology" in detail.facts and "FastAPI" in detail.technologies
    facts = await retrieval.get_facts(db, "auralis", fact_type=FactType.challenge)
    assert facts.count >= 1 and all(f.type == FactType.challenge for f in facts.facts)
    claimed = await retrieval.get_facts(db, "auralis", status=FactStatus.claimed)
    assert claimed.count == sum(len(v) for v in detail.facts.values())
    assert await retrieval.get_project(db, "nope") is None


async def test_candidates_are_admin_only(db, seed_data):
    await seed_all(db, seed_data)
    public = {p.slug for p in await retrieval.list_projects(db)}
    assert "vetra" not in public and "urjasetu" not in public and "auralis" in public
    assert await retrieval.get_project(db, "vetra") is None
    assert await retrieval.get_facts(db, "urjasetu") is None
    assert not [
        h for h in await retrieval.search_projects(db, "farm animals edge diagnosis") if h.project.slug == "vetra"
    ]
    assert await retrieval.get_project(db, "vetra", public=False) is not None
    assert "urjasetu" in {p.slug for p in await retrieval.list_projects(db, public=False)}


async def test_private_repository_is_redacted_publicly(db, seed_data, github_mock, gh, sample_readme):
    await seed_all(db, seed_data)
    auralis = (await db.execute(select(Project).where(Project.slug == "auralis"))).scalar_one()
    mock_repo(github_mock, "aayush2724/Auralis", head_sha="abc", readme=sample_readme, private=True)
    # Private repos are excluded by default; the redaction layer is still tested for the opt-in case.
    await ingest_readme(db, auralis, gh, include_private=True)
    await db.commit()
    assert auralis.repo_is_private and auralis.status == ProjectStatus.active

    public = await retrieval.get_project(db, "auralis")
    assert public is not None and public.repo_is_private
    assert set(public.facts) <= {"description", "technology"}
    for facts in public.facts.values():
        for f in facts:
            assert all(e.kind in {"portfolio_copy", "manual"} for e in f.evidence)
            assert all("github.com/aayush2724/Auralis/blob" not in e.url for e in f.evidence)
            if f.type == FactType.technology:
                assert set(f.value) == {"name"}
    assert "FastAPI" in public.technologies
    facts = await retrieval.get_facts(db, "auralis", fact_type=FactType.architecture)
    assert facts.count == 0
    hits = await retrieval.search_projects(db, "Playwright worker rate search")
    assert all(f.type in {FactType.description, FactType.technology} for h in hits for f in h.matched)
    skills = await retrieval.search_skill_evidence(db, "fastapi")
    assert skills and all("blob" not in e.url for e in skills[0].evidence)

    full = await retrieval.get_project(db, "auralis", public=False)
    assert "architecture" in full.facts
    assert (await retrieval.get_facts(db, "auralis", fact_type=FactType.architecture, public=False)).count >= 1


async def test_skill_evidence_prefers_readme_backed_projects(db, seed_data, github_mock, gh, auralis_readme):
    await seed_all(db, seed_data)
    auralis = (await db.execute(select(Project).where(Project.slug == "auralis"))).scalar_one()
    mock_repo(github_mock, "aayush2724/Auralis", head_sha="abc", readme=auralis_readme)
    await ingest_readme(db, auralis, gh)
    await db.commit()
    hits = await retrieval.search_skill_evidence(db, "fastapi")
    assert hits and hits[0].project.slug == "auralis" and hits[0].strength.value == "medium"
    assert hits[0].evidence and "README.md" in hits[0].evidence[0].url


async def test_compare(db, seed_data):
    await seed_all(db, seed_data)
    cmp = await retrieval.compare_projects(db, "auralis", "deskguard")
    assert cmp is not None and cmp.a.slug == "auralis" and cmp.b.slug == "deskguard"
    assert "technology" in cmp.dimensions
    assert await retrieval.compare_projects(db, "auralis", "nope") is None
    assert await retrieval.compare_projects(db, "auralis", "vetra") is None  # candidate hidden publicly
