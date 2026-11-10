"""The owner's public profile, as the site states it. Items that the
repositories cannot confirm are labelled as portfolio claims so the
assistant phrases them as such."""

from __future__ import annotations

SITE_URL = "https://aayush-2724.vercel.app"

PROFILE_ITEMS: list[dict[str, str]] = [
    {
        "title": "Who",
        "text": (
            "Aayush Kumar — Computer Science undergraduate (B.E.) at The National Institute of Engineering, Mysore, "
            "based in Bengaluru. Focus: AI/ML, LLM applications and agentic AI, RAG systems, LangGraph, backend and "
            "full-stack engineering, REST APIs, database architecture, distributed systems, data structures and "
            "algorithms, software architecture, cybersecurity."
        ),
        "url": f"{SITE_URL}/#about",
    },
    {
        "title": "Roles",
        "text": (
            "President of the OWASP student chapter at NIE (leads the core team, runs security workshops; the "
            "chapter website was a team build). Backend & AI intern at HSH Technologies, building Translog, an "
            "LLM-assisted air-freight quotation desk (FastAPI, Redis + RQ, Playwright) that is live for client mailboxes."
        ),
        "url": f"{SITE_URL}/#journey",
    },
    {
        "title": "Translog (internship project, private repository: site copy only)",
        "text": (
            "As the portfolio's timeline and Now page describe it: at HSH Technologies Aayush is building Translog, "
            "an LLM-assisted air-freight quotation desk that is live for two client mailboxes. It is built on "
            "FastAPI, with a Redis + RQ job pipeline, Playwright rate automation and a hand-labelled LLM "
            "evaluation harness. The repository is private, so nothing beyond this public description "
            "(architecture details, code, metrics) is available to the assistant."
        ),
        "url": f"{SITE_URL}/#journey",
    },
    {
        "title": "Links",
        "text": (
            "GitHub github.com/aayush2724 · LinkedIn linkedin.com/in/aayush2724 · Email aayush2615@gmail.com · "
            f"Resume {SITE_URL}/resume.pdf. Open to remote internships and freelance work."
        ),
        "url": f"{SITE_URL}/#contact",
    },
    {
        "title": "Hackathons (as stated on the portfolio; not verifiable from repositories)",
        "text": (
            "3rd place at ThinkRoot x Vortex'26 (NIT Trichy) with LeadForge, an AI B2B lead-generation pipeline, "
            "with teammate Kaki Harshita as team Panic-At-The-Deadline; further hackathon participations are "
            "listed on the site's Achievements section."
        ),
        "url": f"{SITE_URL}/#achievements",
    },
    {
        "title": "Beyond code",
        "text": "Plays guitar (still chasing a clean Stairway to Heaven); the site's Pluck It game and live listening card come from that.",
        "url": f"{SITE_URL}/#life",
    },
]
