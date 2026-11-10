from sqlalchemy import func, select

from app.db.models import FactStatus, FactType, KnowledgeVersion, Project, ProjectKnowledge, ProjectSource, SourceKind
from app.knowledge.seed import seed_all


async def test_seed_creates_projects_and_claimed_facts(db, seed_data):
    totals = await seed_all(db, seed_data)
    assert totals["projects"] == len(seed_data["projects"])
    projects = (await db.execute(select(Project))).scalars().all()
    assert {p.slug for p in projects} == {r["slug"] for r in seed_data["projects"]}

    auralis = next(p for p in projects if p.slug == "auralis")
    assert auralis.repo_full_name == "aayush2724/Auralis"
    assert auralis.attribution is not None and auralis.attribution.value == "co_built"
    facts = (
        (await db.execute(select(ProjectKnowledge).where(ProjectKnowledge.project_id == auralis.id))).scalars().all()
    )
    assert facts and all(f.status == FactStatus.claimed for f in facts)
    techs = {f.key for f in facts if f.fact_type == FactType.technology}
    assert "fastapi" in techs and "langgraph" in techs
    # Every claim cites the portfolio data file it came from.
    assert all(
        any(e["url"].startswith("https://github.com/aayush2724/Portfolio/blob/") for e in f.evidence) for f in facts
    )
    sources = (await db.execute(select(ProjectSource).where(ProjectSource.project_id == auralis.id))).scalars().all()
    assert {s.kind for s in sources} == {SourceKind.portfolio_copy}

    # Candidates (on GitHub, not on the site) are present but marked.
    vetra = next(p for p in projects if p.slug == "vetra")
    assert vetra.status.value == "candidate"
    checkmate = next(p for p in projects if p.slug == "checkmate")
    assert checkmate.repo_full_name is None


async def test_seed_is_idempotent(db, seed_data):
    await seed_all(db, seed_data)
    versions_before = (await db.execute(select(func.count()).select_from(KnowledgeVersion))).scalar_one()
    totals = await seed_all(db, seed_data)
    versions_after = (await db.execute(select(func.count()).select_from(KnowledgeVersion))).scalar_one()
    assert totals["facts_changed"] == 0
    assert versions_before == versions_after
    assert (await db.execute(select(func.count()).select_from(Project))).scalar_one() == len(seed_data["projects"])
