/**
 * The scripted portfolio guide.
 *
 * Extracted unchanged from PortfolioBot.jsx so it can be unit-tested and kept
 * as the assistant's offline fallback: when the live API is unreachable or
 * not configured, the panel answers from this script instead of failing.
 * `rng` is injectable so tests get deterministic greetings and fallbacks.
 */
import { LEETCODE_SOLVED, REPO_COUNT, HACKATHONS, CONTRIBUTIONS } from "../data/stats"
import portfolioData from "../data/portfolioData.json"
import { projects } from "../data/projects"

const projectKeywords = {
  "Translog": ["translog", "freight", "quotation", "hsh", "internship"],
  "DeskGuard": ["deskguard", "desk guard", "seat booking", "library seat", "ghost seat"],
  "AlgoVision": ["algovision", "algo vision", "visualizer", "algorithm", "sorting"],
  "CheckMate": ["checkmate", "check mate", "chess"],
  "Disaster Relief System": ["disaster", "relief", "emergency"],
  "LeadForge": ["leadforge", "lead forge", "lead"],
  "Beatzy": ["beatzy", "beat", "music collab"],
  "Citizen Resolver System": ["citizen", "resolver", "civic", "complaint"],
  "MindFlow": ["mindflow", "mind flow", "notes", "note-taking"],
  "Chord Detector": ["chord", "detector", "guitar chord", "audio"],
  "Visitor Management System": ["visitor", "check-in", "qr code"],
  "MedVerify": ["medverify", "med verify", "medical", "healthcare"],
  "Job Portal": ["job", "portal", "hiring", "resume"],
};

export function searchPortfolio(query, rng = Math.random) {
  const q = query.toLowerCase().trim();

  // 1. Greetings — varied, natural
  if (/^(hi|hello|hey|yo|sup|howdy|hii|heyy|good\s*(morning|afternoon|evening))/.test(q) || q === "hlo") {
    const greetings = [
      "Hey! I'm **PortfolioBot** — a scripted guide to Aayush's portfolio. Ask me about his projects, skills, hackathons, or LeetCode progress.",
      `Hi there! 👋 Ask me about Aayush's **${REPO_COUNT} GitHub repos**, his **${LEETCODE_SOLVED} LeetCode problems**, or his **hackathon results**. I've got the details.`,
      "Hello! I'm PortfolioBot. I can tell you about Aayush's **full-stack projects**, **tech stack**, **college life**, or even his **guitar skills**. What's up?",
    ];
    return greetings[Math.floor(rng() * greetings.length)];
  }

  // 2. Specific Projects
  for (const p of projects) {
    const keywords = projectKeywords[p.name] || [p.name.toLowerCase()];
    if (keywords.some(kw => q.includes(kw))) {
      return `**${p.name}** ${p.badge ? `(${p.badge})` : ""}\n\n` +
        `${p.desc}\n\n` +
        `**Stack:** ${p.tags.join(", ")}\n` +
        `**Highlights:** ${p.highlight}\n\n` +
        `👉 [GitHub](${p.gh}) ${p.demo ? `| [Live Demo](${p.demo})` : ""}`;
    }
  }

  // 3. LeetCode / DSA
  if (/leetcode|leet\s*code|dsa|problems?\s*solved|rating|ranking|streak|contest/.test(q)) {
    const lc = portfolioData.leetcode;
    if (lc?.stats) {
      return `Here's my LeetCode breakdown:\n\n` +
        `• **${lc.stats.totalSolved}** problems solved (${lc.stats.easy} easy, ${lc.stats.medium} medium, ${lc.stats.hard} hard)\n` +
        `• **${lc.streak}**-day longest streak this year\n` +
        `• **${lc.totalActiveDays}** active days in the last year\n` +
        `• Counted across both of my accounts\n\n` +
        `I grind DSA daily in **C++** — mostly trees, graphs, DP, and binary search.`;
    }
    return `I'm active on LeetCode — currently at ${LEETCODE_SOLVED}+ problems and counting. I focus on C++ and aim for consistency over streaks.`;
  }

  // 4. Hackathons
  if (/hackathon|win|won|competition|thinkroot|vortex|goldman|samsung|ennovatex|panic|deadline|trophy|prize|final round|finalist|top 200|8700/.test(q)) {
    return "I compete in hackathons with my teammate **Kaki Harshita** under our team **Panic-At-The-Deadline** 🏆\n\n" +
      "**Highlights:**\n" +
      "• 🥉 **3rd Place** at ThinkRoot x Vortex'26 (NIT Trichy) — built [LeadForge](https://github.com/aayush2724/LeadForge), an AI B2B lead generation pipeline\n" +
      "• 🚀 **Final-round qualifier** in a national-level hackathon — ranked among the **top 200 teams out of 8,700**\n" +
      "• 🚀 **Goldman Sachs India Hackathon 2026** — multi-agent drone routing optimization in C++\n" +
      "• 📱 **Samsung ennovateX AX Hackathon** — *Phantom Memory*, a 3-tier adaptive memory pipeline for mobile agents\n\n" +
      "We work well under pressure — hence the team name 😄";
  }

  // 5. Tech Stack
  if (/stack|tech|skill|language|framework|tool|python|react|javascript|typescript|c\+\+|node|database|docker|next/.test(q)) {
    return "Here's my full toolkit:\n\n" +
      "**Languages:** Python, Java, C++, JavaScript, TypeScript, SQL\n\n" +
      "**Backend:** FastAPI, Node.js, Express, REST APIs, WebSockets, Server-Sent Events, JWT, OAuth 2.0\n\n" +
      "**AI / LLM:** LangChain, LangGraph, RAG, embeddings, FAISS, Hugging Face Transformers, prompt engineering, LLM evaluation harnesses\n\n" +
      "**Data & Queues:** PostgreSQL, Redis, MongoDB, Firebase, RQ\n\n" +
      "**Infra & Tools:** Docker, Linux, Git, GitHub Actions, Playwright, Postman, Railway, Render, Vercel\n\n" +
      "**Frontend:** React, Next.js, TypeScript, Tailwind CSS, Three.js, GSAP\n\n" +
      "Backend and AI first, but I ship the whole pipeline — UI to infra.";
  }

  // 6. Contact / Socials / Hire
  if (/contact|hire|email|connect|social|linkedin|instagram|resume|reach|collab/.test(q)) {
    return "Let's connect!\n\n" +
      "• 📧 **Email:** [aayush2615@gmail.com](mailto:aayush2615@gmail.com)\n" +
      "• 💼 **LinkedIn:** [linkedin.com/in/aayush2724](https://linkedin.com/in/aayush2724)\n" +
      `• 💻 **GitHub:** [github.com/aayush2724](https://github.com/aayush2724) (${REPO_COUNT} repos)\n` +
      "• 📸 **Instagram:** [@aayussh.27](https://instagram.com/aayussh.27)\n\n" +
      "Currently **open to remote internships and freelance projects**. Drop me an email!";
  }

  // 7. Guitar / Music / Hobbies
  if (/guitar|music|stairway|hobb|free\s*time|weekend|play|song|band/.test(q)) {
    return "Outside of code, I'm a **guitarist** 🎸 — been trying to master **Stairway to Heaven** for over a year now. It's humbling.\n\n" +
      "Music also shows up in my work: I built **Chord Detector** (ML-powered guitar chord recognition) and **Beatzy** (a music collaboration platform). " +
      "It's basically where my two worlds collide.";
  }

  // 8. General Projects
  if (/project|shipped|recent|built|work|repo|portfolio|made/.test(q)) {
    const sorted = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const latest = sorted[0];
    return `I've shipped **${REPO_COUNT} public repos** spanning AI, full-stack, civic tech, and music tech.\n\n` +
      `**Recent work:**\n` +
      `• **${latest.name}** — ${latest.desc}\n` +
      `• **Translog** — LLM-assisted air-freight quotation desk, built at HSH Technologies\n` +
      `• **AlgoVision** — algorithm learning engine with 474 live tracers\n\n` +
      `**Proudest:** LeadForge (3rd place at ThinkRoot x Vortex'26), Auralis, Translog\n\n` +
      `Ask me about any specific project for details!`;
  }

  // 9. Learning / Current
  if (/learn|study|current|focus|building|working on|right now|next/.test(q)) {
    return "Currently I'm:\n\n" +
      "• 🧠 Going deep on **LLMs, RAG and GenAI** — retrieval pipelines, embeddings, evals and agentic workflows\n" +
      "• 🔨 Building **Translog** at HSH Technologies — an LLM-assisted air-freight quotation desk on FastAPI, Redis + RQ and Playwright\n" +
      `• ⚔️ Grinding **DSA in C++** on LeetCode (${LEETCODE_SOLVED}+ solved)\n` +
      "• 🎸 Still trying to nail **Stairway to Heaven** on guitar\n" +
      "• 🔍 Looking for **remote internships and freelance projects**\n\n" +
      "I'm a 2nd year CS student at **NIE, Mysore** — always shipping something.";
  }

  // 10. About / Bio / College
  if (/about|who|yourself|bio|profile|college|nie|mysore|bengaluru|bangalore|student|age|year|where|owasp|president|club/.test(q)) {
    return "I'm **Aayush Kumar** — a 2nd year B.E. CS student at **The National Institute of Engineering (NIE), Mysore**, based in **Bengaluru**.\n\n" +
      "I'm also the **President of the OWASP student chapter** at my college, where I lead a 29-member core team, run security workshops and built the chapter website.\n\n" +
      "I build things end-to-end: REST APIs, React UIs, AI integrations, async job queues — the full stack. " +
      `I've got **${REPO_COUNT} GitHub repos**, **${LEETCODE_SOLVED}+ LeetCode problems**, and **GitHub Pro** with the YOLO and Pull Shark badges 🦈\n\n` +
      "I hack with my teammate **Kaki Harshita** as **Panic-At-The-Deadline** and I'm always looking for the next project to ship.";
  }

  // 11. Music Intelligence Engine (specific project focus)
  if (/music intelligence|intelligence engine|audio fingerprint|acrcloud|saas/.test(q)) {
    return "**Music Intelligence Engine** — a side project 🎵\n\n" +
      "It's an audio fingerprinting + full-stack SaaS platform. Think Shazam-like capability but built as a developer tool.\n\n" +
      "**Tech:** Python, ACRCloud API, React, Node.js\n\n" +
      "This project sits at the intersection of my two biggest interests: **music** and **engineering**. It's on the back burner while Translog and Auralis get my time.";
  }

  // 12. Goldman Sachs / Samsung specifics
  if (/goldman|sachs|drone|routing|phantom|memory|mobile agent/.test(q)) {
    return "Two notable hackathon builds:\n\n" +
      "**Goldman Sachs India Hackathon 2026:**\n" +
      "Built a **multi-agent drone routing optimization system** in C++. Tackled NP-hard path planning with heuristic solvers under time pressure.\n\n" +
      "**Samsung ennovateX AX Hackathon:**\n" +
      "Built **Phantom Memory** — a 3-tier adaptive memory pipeline for mobile agents. The idea was giving mobile AI context persistence across sessions.";
  }

  // 13. GitHub specifics
  if (/github|repos|repository|open source|contribution|star/.test(q)) {
    return "Here's my GitHub snapshot:\n\n" +
      `• **${REPO_COUNT} public repositories** across JavaScript, Python, TypeScript, HTML, CSS, C++\n` +
      `• **${CONTRIBUTIONS}+ contributions** this year\n` +
      "• **GitHub Pro** with YOLO 🪂 and Pull Shark 🦈 achievements\n\n" +
      "**Popular repos:** Portfolio, Beatzy, Citizen-Resolver-System, LeadForge, Chord-Detector, CheckMate\n\n" +
      "Check it out: [github.com/aayush2724](https://github.com/aayush2724)";
  }

  // 14. Philosophy / Why code
  if (/why|passion|motiv|inspir|philosophy|love.*code|code.*love/.test(q)) {
    return "I code because I love building things that **work end-to-end**. From a React component to a REST API to an AI pipeline — I want to own the whole stack.\n\n" +
      "Music taught me that: every function a verse, every algorithm a rhythm. I write software the way I play guitar — **with passion, precision, and a bit of improvisation**.";
  }

  // 15. Default fallbacks — specific, not generic
  const fallbacks = [
    "Hmm, I don't have that exact detail. But I know a lot! Try asking about **projects**, **LeetCode stats**, **hackathon results**, **tech stack**, or **how to contact Aayush**.",
    "That's outside my database. I'm great with **project details**, **DSA grind**, **hackathon stories**, and **career info**. Give me another shot!",
    "That one's not in my script 😅 Try asking about **Beatzy**, **LeadForge**, **LeetCode**, or **what Aayush is currently building**.",
    `I can't help with that, but I *can* tell you about **${REPO_COUNT} GitHub repos**, **${HACKATHONS} hackathon competitions**, and **${LEETCODE_SOLVED} LeetCode problems**. Pick one!`,
  ];
  return fallbacks[Math.floor(rng() * fallbacks.length)];
}
