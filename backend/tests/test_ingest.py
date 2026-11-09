import httpx
from sqlalchemy import select

from app.db.models import (
    FactStatus,
    FactType,
    KnowledgeVersion,
    Project,
    ProjectKnowledge,
    ProjectSkill,
    ProjectSource,
    SourceKind,
)
from app.knowledge.ingest import ingest_readme
from app.knowledge.seed import seed_all
from tests.conftest import mock_repo, readme_payload

HEAD = "29b21d2233c3386c6195d3f53ab7fecf6548a580"


async def _seeded_auralis(db, seed_data):
    await seed_all(db, seed_data)
    return (await db.execute(select(Project).where(Project.slug == "auralis"))).scalar_one()


async def test_ingest_creates_permalinked_sources_and_promotes_claims(db, seed_data, github_mock, gh, auralis_readme):
    project = await _seeded_auralis(db, seed_data)
    mock_repo(github_mock, "aayush2724/Auralis", head_sha=HEAD, readme=auralis_readme)

    report = await ingest_readme(db, project, gh)
    await db.commit()
    assert not report.skipped and report.sha == HEAD and report.sections > 5
    assert "FastAPI" in report.technologies and "LangGraph" in report.technologies

    sources = (
        (
            await db.execute(
                select(ProjectSource).where(
                    ProjectSource.project_id == project.id, ProjectSource.kind == SourceKind.readme
                )
            )
        )
        .scalars()
        .all()
    )
    assert len(sources) == report.sections
    assert all(s.url.startswith(f"https://github.com/aayush2724/Auralis/blob/{HEAD}/README.md") for s in sources)
    assert any("#" in s.url for s in sources)

    fastapi = (
        await db.execute(
            select(ProjectKnowledge).where(
                ProjectKnowledge.project_id == project.id,
                ProjectKnowledge.fact_type == FactType.technology,
                ProjectKnowledge.key == "fastapi",
            )
        )
    ).scalar_one()
    assert fastapi.status == FactStatus.implemented
    assert fastapi.current_version >= 2  # promoted from the seed's claim
    assert any(e.get("kind") == "readme" for e in fastapi.evidence)
    versions = (
        (
            await db.execute(
                select(KnowledgeVersion)
                .where(KnowledgeVersion.knowledge_id == fastapi.id)
                .order_by(KnowledgeVersion.version)
            )
        )
        .scalars()
        .all()
    )
    assert versions[0].status == FactStatus.claimed and versions[-1].status == FactStatus.implemented
    assert versions[-1].supersedes_version_id == versions[-2].id

    overview = (
        await db.execute(
            select(ProjectKnowledge).where(
                ProjectKnowledge.project_id == project.id, ProjectKnowledge.key == "readme.overview"
            )
        )
    ).scalar_one()
    assert overview.status == FactStatus.implemented and overview.value["text"]
    assert project.summary == overview.value["text"][:1000]
    skill = (
        await db.execute(
            select(ProjectSkill).where(ProjectSkill.project_id == project.id, ProjectSkill.skill == "FastAPI")
        )
    ).scalar_one()
    assert skill.strength.value == "medium"
    assert project.readme_sha == HEAD and project.readme_blob_sha and project.readme_etag and project.repo_description


async def test_unchanged_readme_is_a_conditional_request_and_no_rewrite(db, seed_data, github_mock, gh, auralis_readme):
    project = await _seeded_auralis(db, seed_data)
    mock_repo(github_mock, "aayush2724/Auralis", head_sha=HEAD, readme=auralis_readme)
    await ingest_readme(db, project, gh)
    await db.commit()
    versions = (await db.execute(select(KnowledgeVersion))).scalars().all()
    calls = gh.calls

    # A new commit that does not touch the README: head moves, README ETag matches → 304, nothing rewritten.
    github_mock.get("/repos/aayush2724/Auralis/commits/main").mock(
        return_value=httpx.Response(200, json={"sha": "f00dbabe"})
    )
    report = await ingest_readme(db, project, gh)
    await db.commit()
    assert report.skipped and report.reason == "unchanged"
    assert gh.calls == calls + 3  # repo, head, readme (304)
    assert len((await db.execute(select(KnowledgeVersion))).scalars().all()) == len(versions)
    assert project.readme_sha == HEAD  # permalinks still point at the commit the README was read at


async def test_changed_readme_appends_versions_records_planned_items_and_demotes(
    db, seed_data, github_mock, gh, sample_readme
):
    project = await _seeded_auralis(db, seed_data)
    first = "# Auralis\n\nAuralis is an AI sales intelligence platform built with FastAPI and Kubernetes.\n"
    mock_repo(github_mock, "aayush2724/Auralis", head_sha="aaaa1111", readme=first)
    await ingest_readme(db, project, gh)
    await db.commit()
    overview = (
        await db.execute(
            select(ProjectKnowledge).where(
                ProjectKnowledge.project_id == project.id, ProjectKnowledge.key == "readme.overview"
            )
        )
    ).scalar_one()
    assert overview.current_version == 1
    k8s = (
        await db.execute(
            select(ProjectKnowledge).where(
                ProjectKnowledge.project_id == project.id, ProjectKnowledge.key == "kubernetes"
            )
        )
    ).scalar_one()
    assert k8s.status == FactStatus.implemented

    github_mock.get("/repos/aayush2724/Auralis/commits/main").mock(
        return_value=httpx.Response(200, json={"sha": "bbbb2222"})
    )
    github_mock.get("/repos/aayush2724/Auralis/readme").mock(
        return_value=httpx.Response(200, json=readme_payload(sample_readme, sha="blob-2"), headers={"ETag": '"v2"'})
    )
    report = await ingest_readme(db, project, gh)
    await db.commit()
    assert not report.skipped and report.demoted >= 1
    await db.refresh(overview)
    assert overview.current_version == 2
    planned = (
        (
            await db.execute(
                select(ProjectKnowledge).where(
                    ProjectKnowledge.project_id == project.id, ProjectKnowledge.status == FactStatus.planned
                )
            )
        )
        .scalars()
        .all()
    )
    assert {p.value["text"] for p in planned if p.fact_type == FactType.feature} == {
        "Client ACCEPT / REJECT handling",
        "Sea freight pricing",
    }
    # Kubernetes is no longer stated: it falls back to claimed, with its history intact.
    await db.refresh(k8s)
    assert k8s.status == FactStatus.claimed and k8s.current_version == 2
    # Old-SHA README sources are replaced, not accumulated; README evidence is replaced, not stacked.
    sources = (
        (
            await db.execute(
                select(ProjectSource).where(
                    ProjectSource.project_id == project.id, ProjectSource.kind == SourceKind.readme
                )
            )
        )
        .scalars()
        .all()
    )
    assert {s.ref_sha for s in sources} == {"bbbb2222"}
    assert all("bbbb2222" in e["url"] for e in overview.evidence if e.get("kind") == "readme")


async def test_project_without_repo_is_skipped(db, seed_data, gh):
    await seed_all(db, seed_data)
    checkmate = (await db.execute(select(Project).where(Project.slug == "checkmate"))).scalar_one()
    report = await ingest_readme(db, checkmate, gh)
    assert report.skipped and report.reason == "no repository"


async def test_private_repositories_are_skipped_and_nothing_is_stored(db, seed_data, github_mock, gh, sample_readme):
    await seed_all(db, seed_data)
    project = (await db.execute(select(Project).where(Project.slug == "auralis"))).scalar_one()
    mock_repo(github_mock, "aayush2724/Auralis", head_sha="p1", readme=sample_readme, private=True)
    report = await ingest_readme(db, project, gh)
    await db.commit()
    assert report.skipped and report.reason == "private repository (excluded)"
    sources = (
        (
            await db.execute(
                select(ProjectSource).where(
                    ProjectSource.project_id == project.id, ProjectSource.kind == SourceKind.readme
                )
            )
        )
        .scalars()
        .all()
    )
    assert sources == [] and project.readme_sha is None
