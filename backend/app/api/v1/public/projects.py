"""Public, read-only project knowledge.

Visibility is enforced in `knowledge.retrieval` with `public=True`: candidate
projects (on GitHub, not published on the site) are invisible here, and a
project with a private repository exposes only descriptions and technology
names. No admin or operational data is reachable from these routes.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.errors import ApiError
from app.db.models import FactStatus, FactType
from app.db.session import get_session
from app.knowledge import retrieval
from app.knowledge.schemas import FactList, ProjectDetail, ProjectSummary

router = APIRouter(prefix="/projects", tags=["projects"])

SLUG = Path(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=64)


@router.get("", response_model=list[ProjectSummary])
async def list_projects(session: AsyncSession = Depends(get_session)) -> list[ProjectSummary]:
    return await retrieval.list_projects(session, public=True)


@router.get("/{slug}", response_model=ProjectDetail)
async def get_project(slug: str = SLUG, session: AsyncSession = Depends(get_session)) -> ProjectDetail:
    detail = await retrieval.get_project(session, slug, public=True)
    if detail is None:
        raise ApiError(404, "not_found", f"No project with slug '{slug}'")
    return detail


@router.get("/{slug}/knowledge", response_model=FactList)
async def get_knowledge(
    slug: str = SLUG,
    fact_type: FactType | None = Query(None, alias="type"),
    status: FactStatus | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> FactList:
    facts = await retrieval.get_facts(session, slug, fact_type=fact_type, status=status, public=True)
    if facts is None:
        raise ApiError(404, "not_found", f"No project with slug '{slug}'")
    return facts
