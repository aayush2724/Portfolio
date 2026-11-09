"""Operator commands.

uv run python -m app.cli seed            # load backend/seeds/projects.seed.json
uv run python -m app.cli ingest --all    # README ingestion for every project with a repo
uv run python -m app.cli ingest --slug auralis --force
uv run python -m app.cli hash-password   # argon2id hash for ADMIN_PASSWORD_HASH
uv run python -m app.cli list
    uv run python -m app.cli purge           # visitor records past the retention window
"""

from __future__ import annotations

import argparse
import asyncio
import getpass
import sys

import structlog
from sqlalchemy import select

from app.config import get_settings
from app.db.models import Project
from app.db.session import dispose_engine, get_sessionmaker
from app.github.client import GitHubClient
from app.knowledge.ingest import ingest_readme
from app.knowledge.seed import load_seed, seed_all
from app.observability.logging import configure_logging

log = structlog.get_logger("cli")


async def cmd_seed(args: argparse.Namespace) -> int:
    settings = get_settings()
    seed = load_seed(args.file or settings.seed_file)
    async with get_sessionmaker()() as session:
        totals = await seed_all(session, seed)
    print(f"seeded {totals['projects']} projects, {totals['facts_changed']} fact versions written")
    return 0


async def cmd_ingest(args: argparse.Namespace) -> int:
    settings = get_settings()
    gh = GitHubClient(
        settings.github_token,
        base_url=settings.github_api_base,
        timeout=settings.github_timeout_seconds,
        max_file_bytes=settings.github_max_file_bytes,
        max_total_bytes=settings.github_max_total_bytes,
    )
    try:
        async with get_sessionmaker()() as session:
            stmt = select(Project).where(Project.repo_full_name.is_not(None)).order_by(Project.sort_order)
            if args.slug:
                stmt = select(Project).where(Project.slug == args.slug)
            projects = (await session.execute(stmt)).scalars().all()
            if not projects:
                print("no matching projects", file=sys.stderr)
                return 1
            for project in projects:
                try:
                    report = await ingest_readme(session, project, gh, force=args.force)
                    await session.commit()
                except Exception as exc:  # noqa: BLE001 - keep going for the other repos
                    await session.rollback()
                    print(f"{project.slug}: FAILED {type(exc).__name__}: {exc}")
                    continue
                if report.skipped:
                    print(f"{project.slug}: skipped ({report.reason})")
                else:
                    print(
                        f"{project.slug}: {report.sections} sections, {report.facts_changed} fact versions, "
                        f"{report.promoted} claims promoted, tech={', '.join(report.technologies) or '-'}"
                    )
        print(f"github api calls: {gh.calls}")
    finally:
        await gh.aclose()
    return 0


async def cmd_purge(_: argparse.Namespace) -> int:
    from app.assistant.retention import purge_expired

    async with get_sessionmaker()() as session:
        counts = await purge_expired(session, get_settings().conversation_retention_days)
    print(f"purged {counts['sessions']} visitor sessions and {counts['messages']} messages")
    return 0


async def cmd_list(_: argparse.Namespace) -> int:
    async with get_sessionmaker()() as session:
        projects = (await session.execute(select(Project).order_by(Project.sort_order))).scalars().all()
        for p in projects:
            print(f"{p.slug:22} {p.status.value:10} {p.repo_full_name or '-':40} readme@{(p.readme_sha or '-')[:7]}")
    return 0


def cmd_hash_password(_: argparse.Namespace) -> int:
    from argon2 import PasswordHasher

    pw = getpass.getpass("Admin password: ")
    again = getpass.getpass("Repeat: ")
    if pw != again or len(pw) < 12:
        print("passwords differ or are shorter than 12 characters", file=sys.stderr)
        return 1
    print(PasswordHasher().hash(pw))
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="command", required=True)
    p_seed = sub.add_parser("seed")
    p_seed.add_argument("--file")
    p_ing = sub.add_parser("ingest")
    p_ing.add_argument("--slug")
    p_ing.add_argument("--all", action="store_true")
    p_ing.add_argument("--force", action="store_true")
    sub.add_parser("list")
    sub.add_parser("purge")
    sub.add_parser("hash-password")
    args = parser.parse_args(argv)

    settings = get_settings()
    configure_logging(settings.log_level, json_logs=False)

    if args.command == "hash-password":
        return cmd_hash_password(args)

    async def run() -> int:
        try:
            if args.command == "seed":
                return await cmd_seed(args)
            if args.command == "ingest":
                return await cmd_ingest(args)
            if args.command == "purge":
                return await cmd_purge(args)
            return await cmd_list(args)
        finally:
            await dispose_engine()

    return asyncio.run(run())


if __name__ == "__main__":
    raise SystemExit(main())
