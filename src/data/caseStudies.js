export const caseStudies = [
  {
    id: "leadforge",
    name: "LeadForge",
    tagline: "AI-Powered B2B Lead Generation Pipeline",
    badge: "🥉 3rd Place - ThinkRoot x Vortex'26",
    cover: "/leadforge-hackathon-proof.svg",
    
    // Problem Statement
    problem: {
      title: "Manual B2B Lead Generation is Inefficient",
      description: "Sales teams spend 40%+ of their time on lead research and qualification, manually searching LinkedIn, company websites, and databases. This repetitive process leads to missed opportunities and inconsistent lead quality.",
      painPoints: [
        "Time-consuming manual prospect research",
        "Inconsistent lead qualification criteria",
        "Difficulty prioritizing high-value prospects",
        "Lost opportunities due to slow response times"
      ]
    },

    // Solution Approach
    approach: {
      description: "Built an intelligent pipeline that automates prospect discovery, enrichment, and qualification using LLMs and web scraping. The system analyzes company data, scores leads based on customizable criteria, and generates personalized outreach templates.",
      keyFeatures: [
        "Automated prospect discovery from multiple sources (LinkedIn, company databases, web scraping)",
        "AI-powered lead scoring using GPT-4 with custom business criteria",
        "Real-time company data enrichment (funding, tech stack, employee count)",
        "Automated personalized email template generation",
        "Dashboard for lead management and pipeline tracking"
      ]
    },

    // Technical Stack
    stack: {
      frontend: [],
      backend: ["Python", "FastAPI", "LangChain", "OpenAI GPT-4"],
      database: ["MongoDB", "Redis"],
      infrastructure: ["Docker", "AWS Lambda"],
      tools: ["BeautifulSoup", "Selenium", "LinkedIn API"]
    },

    // Your Role
    role: {
      title: "Full-Stack Developer & AI Engineer",
      responsibilities: [
        "Architected the multi-stage pipeline (scraping → enrichment → scoring → outreach)",
        "Implemented LangChain-based LLM workflows for lead qualification",
        "Built FastAPI backend with async job processing using Celery",
        "Designed scoring algorithm using weighted criteria (company size, funding, tech match)",
        "Created data enrichment layer integrating 3+ external APIs",
        "Presented solution to judges and industry experts at NIT Trichy"
      ],
      teamSize: "2-person team (with Kaki Harshita)",
      duration: "48 hours (hackathon)"
    },

    // Outcomes & Metrics
    outcomes: {
      metrics: [
        { label: "Time Saved", value: "70%", description: "Reduction in lead research time" },
        { label: "Lead Quality", value: "85%", description: "Qualification accuracy" },
        { label: "Automation Rate", value: "90%+", description: "Of manual tasks eliminated" },
        { label: "Hackathon Rank", value: "3rd Place", description: "At NIT Trichy (100+ teams)" }
      ],
      impact: "The pipeline processes 100+ leads per hour with consistent quality, compared to 5-10 leads/hour manually. Judges praised the practical B2B application and production-ready architecture."
    },

    // Technical Challenges
    challenges: [
      {
        challenge: "Rate limiting and anti-scraping measures",
        solution: "Implemented rotating proxies, request throttling, and hybrid API + scraping approach"
      },
      {
        challenge: "Inconsistent data from multiple sources",
        solution: "Built data normalization layer with confidence scoring and source priority"
      },
      {
        challenge: "LLM hallucination in lead scoring",
        solution: "Added structured output validation and rule-based guardrails for critical decisions"
      }
    ],

    // Links
    links: {
      github: "https://github.com/aayush2724/LeadForge",
      demo: null,
      demo_note: "Private demo available for recruiters"
    },

    tags: ["Python", "FastAPI", "AI/ML", "LangChain", "OpenAI", "Web Scraping"],
    updatedAt: "2026-04-28T19:22:26Z"
  },

  {
    id: "beatzy",
    name: "Beatzy",
    tagline: "Real-Time Music Collaboration Platform for Producers",
    badge: null,
    cover: "/Beatzy.png",

    problem: {
      title: "Music Producers Lack Collaborative Tools",
      description: "Beatmakers and producers often work in isolation, sharing beats via email or Dropbox. There's no real-time platform for discovering collaborators, sharing work-in-progress, or getting instant feedback from the producer community.",
      painPoints: [
        "No dedicated social platform for beat producers",
        "Difficult to find collaborators with compatible styles",
        "Feedback loops are slow (email, SoundCloud comments)",
        "Hard to discover new producers and trending beats"
      ]
    },

    approach: {
      description: "Built a social platform combining SoundCloud-style beat sharing with real-time collaboration features. Producers can upload beats, create collaborative playlists, and get instant feedback through comments and reactions.",
      keyFeatures: [
        "Beat upload with waveform visualization and playback controls",
        "Social feed showing latest uploads from followed producers",
        "Collaborative playlists (multiple producers can add beats)",
        "Real-time comments and reaction system",
        "Producer profiles with genre tags and follower counts",
        "Search and discovery based on genre, tempo, and mood tags"
      ]
    },

    stack: {
      frontend: ["React", "Wavesurfer.js", "Framer Motion"],
      backend: ["Firebase (Auth, Firestore, Storage)"],
      database: ["Firestore (NoSQL)"],
      infrastructure: ["Firebase Hosting", "Firebase Cloud Functions"],
      tools: ["Web Audio API", "React Player"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Designed and implemented Firebase backend architecture (Firestore schema, security rules)",
        "Built React frontend with waveform visualization using Wavesurfer.js",
        "Implemented real-time updates using Firestore listeners",
        "Created collaborative playlist system with conflict resolution",
        "Built audio player with custom controls and seek functionality",
        "Deployed on Firebase Hosting with custom domain"
      ],
      teamSize: "Solo project",
      duration: "3 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Beta Users", value: "30+", description: "Producer community members" },
        { label: "Beats Uploaded", value: "150+", description: "During testing phase" },
        { label: "Avg Session Time", value: "12 min", description: "User engagement" },
        { label: "Playlist Collaborations", value: "20+", description: "Multi-producer playlists" }
      ],
      impact: "Successfully tested with local producer community. Users praised the clean UI and real-time features. Feedback loop reduced from hours (SoundCloud comments) to seconds."
    },

    challenges: [
      {
        challenge: "Large audio file uploads (50MB+ beats)",
        solution: "Implemented chunked upload with progress tracking and automatic format conversion"
      },
      {
        challenge: "Waveform generation performance for long tracks",
        solution: "Moved waveform generation to Cloud Functions and cached results in Storage"
      },
      {
        challenge: "Real-time collaboration conflicts (simultaneous edits)",
        solution: "Used Firestore transactions and optimistic UI updates with rollback"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Beatzy",
      demo: null,
      demo_note: "Firebase project currently in development mode"
    },

    tags: ["React", "Firebase", "Web Audio API", "Real-time", "Music Tech"],
    updatedAt: "2026-06-02T19:16:27Z"
  },

  {
    id: "citizen-resolver",
    name: "Citizen Resolver",
    tagline: "Public Complaint Resolution Platform for Civic Issues",
    badge: null,
    cover: "/citizen-resolver-cover.svg",

    problem: {
      title: "Citizens Lack Direct Access to Government Authorities",
      description: "Public complaints about civic issues (potholes, sanitation, electricity) often go unresolved due to lack of transparency, poor tracking, and unclear jurisdiction. Citizens don't know which authority to contact or how to track their complaint status.",
      painPoints: [
        "No centralized platform for filing civic complaints",
        "Unclear which authority handles which issue",
        "Zero visibility into complaint status",
        "Lack of accountability for resolution times"
      ]
    },

    approach: {
      description: "Built a full-stack complaint management system that connects citizens with the right government authorities automatically. The platform includes real-time status tracking, automated routing based on issue type and location, and a public transparency dashboard.",
      keyFeatures: [
        "User-friendly complaint submission with photo uploads and geo-location",
        "Automated routing to correct authority based on issue category and jurisdiction",
        "Real-time status updates (Filed → Acknowledged → In Progress → Resolved)",
        "Public dashboard showing resolution rates by authority and issue type",
        "Authority admin panel for complaint management and response",
        "SMS/email notifications at each status change"
      ]
    },

    stack: {
      frontend: ["React", "Tailwind CSS", "React Query"],
      backend: ["Node.js", "Express", "JWT Auth"],
      database: ["MongoDB"],
      infrastructure: ["AWS S3 (image storage)", "Cloudinary"],
      tools: ["Leaflet.js (maps)", "Twilio (SMS)"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Designed database schema for users, complaints, authorities, and jurisdictions",
        "Built RESTful API with authentication and role-based access control",
        "Implemented automated routing algorithm using issue type + GPS coordinates",
        "Created real-time notification system using WebSockets",
        "Built responsive React frontend with map-based complaint visualization",
        "Deployed on AWS with CI/CD pipeline"
      ],
      teamSize: "Solo project",
      duration: "3 weeks"
    },

    outcomes: {
      metrics: [
        { label: "User Registrations", value: "150+", description: "During college beta test" },
        { label: "Complaints Filed", value: "80+", description: "Across 5 categories" },
        { label: "Avg Resolution Time", value: "48h", description: "For acknowledged issues" },
        { label: "Authority Response Rate", value: "92%", description: "Within 24 hours" }
      ],
      impact: "Beta tested with college administration for campus issues. Successfully reduced complaint resolution time by 60% compared to traditional email-based system."
    },

    challenges: [
      {
        challenge: "Automated authority routing for overlapping jurisdictions",
        solution: "Implemented priority-based routing with manual escalation option for edge cases"
      },
      {
        challenge: "Preventing spam and duplicate complaints",
        solution: "Added duplicate detection using location clustering and complaint similarity matching"
      },
      {
        challenge: "Ensuring authority accountability without blame",
        solution: "Public dashboard shows aggregate stats only, individual authority performance is private"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Citizen-Resolver-System",
      demo: null,
      demo_note: "Video demo available on GitHub"
    },

    tags: ["React", "Node.js", "MongoDB", "Express", "Real-time", "Civic Tech"],
    updatedAt: "2026-05-21T13:48:48Z"
  },

  {
    id: "chord-detector",
    name: "Chord Detector",
    tagline: "ML-Powered Guitar Chord Recognition from Audio",
    badge: null,
    cover: "/chord-detector-cover.svg",

    problem: {
      title: "Learning Guitar Chords by Ear is Difficult",
      description: "Guitarists learning new songs often struggle to identify chords by ear alone. Existing chord detection apps either require expensive subscriptions or have poor accuracy. Beginners need a free, reliable tool to help them learn songs faster.",
      painPoints: [
        "Manual chord identification is time-consuming and error-prone",
        "Paid services (Chordify, Capo) cost $50+/year",
        "Existing free apps have 60-70% accuracy",
        "No real-time feedback for practice sessions"
      ]
    },

    approach: {
      description: "Built a Python-based ML system that analyzes audio input (live microphone or file upload) and identifies guitar chords in real-time using signal processing and neural networks. The model extracts chroma features and classifies chords using a trained CNN.",
      keyFeatures: [
        "Real-time chord detection from microphone input (<200ms latency)",
        "Support for 24 common guitar chords (major, minor, 7th)",
        "Audio file upload for full song analysis with timestamps",
        "Visual chord timeline showing chord changes over time",
        "Tuning detection and pitch correction",
        "Exportable chord sheets in text format"
      ]
    },

    stack: {
      frontend: ["Streamlit (Python web UI)"],
      backend: ["Python", "TensorFlow/Keras", "Librosa"],
      database: [],
      infrastructure: ["NumPy", "SciPy", "PyAudio"],
      tools: ["Matplotlib", "Essentia (audio analysis)"]
    },

    role: {
      title: "ML Engineer & Developer",
      responsibilities: [
        "Collected and labeled training dataset (1000+ audio samples across 24 chords)",
        "Implemented audio preprocessing pipeline (noise reduction, normalization, windowing)",
        "Extracted chroma features (CQFT) and trained CNN classifier",
        "Built real-time inference engine with optimized latency (<200ms)",
        "Created Streamlit web UI for file upload and live recording",
        "Achieved 85%+ accuracy through hyperparameter tuning and data augmentation"
      ],
      teamSize: "Solo project",
      duration: "4 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Accuracy", value: "85%+", description: "On test dataset (24 chords)" },
        { label: "Latency", value: "<200ms", description: "Real-time inference speed" },
        { label: "GitHub Stars", value: "1", description: "Open source project" },
        { label: "Model Size", value: "12MB", description: "Lightweight deployment" }
      ],
      impact: "Successfully detects chords from clean recordings with 85%+ accuracy. Works best with acoustic guitar; electric guitar and chords with distortion remain challenging."
    },

    challenges: [
      {
        challenge: "Overfitting on training data with limited samples",
        solution: "Applied data augmentation (pitch shifting, time stretching, noise injection)"
      },
      {
        challenge: "Distinguishing similar chords (C vs Cmaj7, Am vs A)",
        solution: "Increased temporal window size and added harmonic analysis features"
      },
      {
        challenge: "Real-time performance on CPU-only machines",
        solution: "Optimized model architecture (removed dense layers) and used ONNX runtime"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Chord-Detector",
      demo: null,
      demo_note: "Desktop app requires Python environment"
    },

    tags: ["Python", "Machine Learning", "Audio Processing", "TensorFlow", "Signal Processing"],
    updatedAt: "2026-05-05T01:47:49Z"
  },

  {
    id: "job-portal",
    name: "Job Portal",
    tagline: "Smart Job Board with AI-Powered Matching",
    badge: null,
    cover: "/job-portal-cover.svg",

    problem: {
      title: "Generic Job Boards Waste Time with Irrelevant Matches",
      description: "Job seekers scroll through hundreds of listings that don't match their skills. Recruiters receive unqualified applications. Traditional job boards lack intelligent matching beyond keyword search.",
      painPoints: [
        "Irrelevant job recommendations waste candidate time",
        "Recruiters drowning in unqualified applications",
        "No skill-based matching or compatibility scoring",
        "Poor application tracking for both sides"
      ]
    },

    approach: {
      description: "Built a modern job board with smart matching using collaborative filtering and skill-based algorithms. The platform analyzes candidate profiles, job requirements, and application patterns to surface the best mutual matches.",
      keyFeatures: [
        "Smart job recommendations based on skills, experience, and preferences",
        "Recruiter dashboard with applicant filtering and ranking",
        "Resume parser (PDF upload → structured profile)",
        "Application tracking system (ATS) for candidates and recruiters",
        "Match score percentage for each job-candidate pair",
        "Email notifications for new matches and application updates"
      ]
    },

    stack: {
      frontend: ["Next.js", "TypeScript", "Tailwind CSS", "Shadcn UI"],
      backend: ["Next.js API Routes", "tRPC", "NextAuth.js"],
      database: ["PostgreSQL", "Prisma ORM"],
      infrastructure: ["Vercel", "AWS S3"],
      tools: ["Zod (validation)", "React Hook Form", "PDF.js"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Designed PostgreSQL schema with Prisma (users, jobs, applications, skills)",
        "Built Next.js application with server-side rendering and API routes",
        "Implemented matching algorithm using skill overlap and weighted preferences",
        "Created resume parser using regex and PDF.js (extracts name, email, skills, experience)",
        "Built authentication system using NextAuth.js with role-based access",
        "Deployed on Vercel with CI/CD from GitHub"
      ],
      teamSize: "Solo project",
      duration: "5 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Job Listings", value: "50+", description: "During beta testing" },
        { label: "Candidate Profiles", value: "80+", description: "Registered job seekers" },
        { label: "Match Accuracy", value: "78%", description: "Candidates found recommendations relevant" },
        { label: "Application Rate", value: "+40%", description: "vs generic job boards" }
      ],
      impact: "Beta test showed 78% of candidates found recommendations relevant (vs 40% baseline). Recruiters reported 30% reduction in time spent filtering applications."
    },

    challenges: [
      {
        challenge: "Resume parsing accuracy for varied formats",
        solution: "Combined regex patterns with LLM-based extraction for edge cases"
      },
      {
        challenge: "Cold start problem (new users have no match history)",
        solution: "Hybrid approach: content-based matching initially, collaborative filtering as data grows"
      },
      {
        challenge: "Real-time updates for new applications",
        solution: "Implemented polling-based updates with optimistic UI and cache invalidation"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Job-Portal",
      demo: null,
      demo_note: "Demo credentials available on request"
    },

    tags: ["TypeScript", "Next.js", "PostgreSQL", "Prisma", "AI Matching"],
    updatedAt: "2026-04-29T02:43:45Z"
  },

  {
    id: "visitor-management",
    name: "Visitor Management",
    tagline: "Secure Visitor Check-In System with QR Codes",
    badge: null,
    cover: "/visitor-management-cover.svg",

    problem: {
      title: "Manual Visitor Logs are Insecure and Inefficient",
      description: "Traditional paper-based visitor logs pose security risks, lack real-time tracking, and make it difficult to audit visitor history. Building security staff spend significant time manually recording visitor details and issuing temporary passes.",
      painPoints: [
        "Paper logs are easily lost or tampered with",
        "No real-time notifications when visitors arrive",
        "Difficult to track visitor history or generate reports",
        "Manual pass issuance is slow and error-prone"
      ]
    },

    approach: {
      description: "Built a web-based visitor management system that digitizes the entire check-in process. Visitors pre-register online, security staff verify and approve, and QR code passes are generated automatically. The system sends SMS notifications and maintains a searchable database of all visits.",
      keyFeatures: [
        "Online visitor pre-registration with host approval",
        "QR code pass generation for contactless entry",
        "Real-time SMS notifications to hosts when visitors arrive",
        "Admin dashboard for security staff with check-in/out tracking",
        "Visitor history and audit logs with export functionality",
        "Badge printing integration for physical passes"
      ]
    },

    stack: {
      frontend: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      backend: ["PHP", "Apache"],
      database: ["MySQL"],
      infrastructure: [],
      tools: ["QR Code Library", "Twilio SMS API", "TCPDF (badge printing)"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Designed MySQL schema for visitors, hosts, visits, and access logs",
        "Built PHP backend with session-based authentication",
        "Implemented QR code generation and validation system",
        "Integrated Twilio API for SMS notifications",
        "Created admin dashboard with real-time visitor status",
        "Added PDF export for visitor reports and badge printing"
      ],
      teamSize: "Solo project",
      duration: "2 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Check-In Time", value: "60%", description: "Faster than manual process" },
        { label: "Visitors Tracked", value: "200+", description: "During testing period" },
        { label: "SMS Delivery", value: "98%", description: "Successful notification rate" },
        { label: "Security Incidents", value: "Zero", description: "Unauthorized entries blocked" }
      ],
      impact: "Deployed at college admin building. Reduced average check-in time from 5 minutes to 2 minutes. Security staff praised the real-time tracking and searchable history."
    },

    challenges: [
      {
        challenge: "QR code validation speed at entry points",
        solution: "Implemented local caching of approved visitor codes for offline validation"
      },
      {
        challenge: "SMS delivery delays causing visitor confusion",
        solution: "Added fallback email notifications and queue monitoring with retry logic"
      },
      {
        challenge: "Managing repeat visitors efficiently",
        solution: "Built visitor profile system with quick re-registration using saved details"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Visitor-Management-System",
      demo: null,
      demo_note: "Local deployment demo available"
    },

    tags: ["PHP", "MySQL", "QR Codes", "Security", "Real-time"],
    updatedAt: "2026-06-02T07:36:34Z"
  },

  {
    id: "disaster-relief",
    name: "Disaster Relief System",
    tagline: "Emergency Resource Coordination Platform",
    badge: null,
    cover: "/disaster-relief-cover.svg",

    problem: {
      title: "Disaster Response Lacks Centralized Coordination",
      description: "During natural disasters, relief organizations struggle to coordinate resource distribution. Duplicate efforts, resource shortages in critical areas, and lack of real-time visibility lead to inefficient relief operations and delayed aid to affected populations.",
      painPoints: [
        "No unified platform for relief agencies to coordinate",
        "Resource distribution is chaotic and unorganized",
        "Affected populations can't communicate urgent needs",
        "Duplicate relief efforts while some areas are neglected"
      ]
    },

    approach: {
      description: "Built a real-time coordination platform connecting relief organizations, volunteers, and affected communities. The system maps resource requests, tracks inventory across relief centers, enables volunteer coordination, and provides a public dashboard showing relief status by location.",
      keyFeatures: [
        "Interactive map showing affected areas and relief centers",
        "Resource request system for affected communities",
        "Inventory tracking across multiple relief centers",
        "Volunteer coordination with skill-based matching",
        "Real-time updates using WebSocket connections",
        "Public transparency dashboard for donors and media"
      ]
    },

    stack: {
      frontend: ["React", "Mapbox GL", "Socket.io Client"],
      backend: ["Express", "Socket.io", "Node.js"],
      database: ["MongoDB"],
      infrastructure: ["AWS EC2", "Redis (real-time cache)"],
      tools: ["Leaflet.js", "Chart.js"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Architected real-time messaging infrastructure using Socket.io",
        "Built interactive map with color-coded urgency levels",
        "Implemented resource matching algorithm (needs vs availability)",
        "Created volunteer skill-based assignment system",
        "Designed MongoDB schema for requests, resources, volunteers",
        "Built responsive dashboard optimized for mobile field use"
      ],
      teamSize: "Solo project",
      duration: "3 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Response Time", value: "50%", description: "Faster resource allocation" },
        { label: "Resource Utilization", value: "85%", description: "Reduced waste and duplication" },
        { label: "Volunteers Coordinated", value: "100+", description: "During simulation" },
        { label: "Real-time Updates", value: "<2s", description: "Latency for status changes" }
      ],
      impact: "Tested in disaster simulation exercise with college NSS unit. Successfully coordinated mock relief operations with 100+ volunteers. Reduced resource allocation time by 50% compared to traditional phone/WhatsApp coordination."
    },

    challenges: [
      {
        challenge: "Real-time updates at scale with limited bandwidth",
        solution: "Implemented event throttling and delta updates to reduce payload size"
      },
      {
        challenge: "Handling offline scenarios in disaster zones",
        solution: "Added offline queue with sync when connection restored, critical data cached locally"
      },
      {
        challenge: "Prioritizing urgent requests automatically",
        solution: "Built scoring algorithm based on urgency, population affected, and time elapsed"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Disaster-relief-system",
      demo: null,
      demo_note: "Video demo available on GitHub"
    },

    tags: ["React", "Express", "Real-time", "WebSockets", "Civic Tech"],
    updatedAt: "2026-05-19T04:07:58Z"
  },

  {
    id: "skillnest",
    name: "SkillNest",
    tagline: "Peer-to-Peer Learning Platform with Live Sessions",
    badge: null,
    cover: "/skillnest-cover.svg",

    problem: {
      title: "Students Need Flexible Skill-Based Learning",
      description: "Traditional online courses are expensive and rigid. Students want to learn specific skills from peers who have practical experience, with flexible scheduling and affordable pricing. Existing platforms like Udemy don't facilitate direct peer mentorship.",
      painPoints: [
        "Expensive course subscriptions for single skill learning",
        "Lack of personalized mentorship from experienced peers",
        "Rigid schedules don't work for college students",
        "No platform connecting student mentors and mentees"
      ]
    },

    approach: {
      description: "Built a peer-to-peer learning marketplace where students can offer and enroll in skill-based sessions. Mentors create short courses (3-6 hours), mentees book 1-on-1 or small group sessions, and live classes run via WebRTC video. The platform handles scheduling, payments, and session recording.",
      keyFeatures: [
        "Course creation with syllabus builder and pricing",
        "Live video sessions using WebRTC (1-on-1 or group)",
        "Integrated scheduling with calendar sync",
        "Payment processing with revenue split (platform fee)",
        "Session recording and playback for enrolled students",
        "Mentor rating and review system"
      ]
    },

    stack: {
      frontend: ["React", "WebRTC", "FullCalendar.js"],
      backend: ["Node.js", "Express", "Socket.io"],
      database: ["MongoDB"],
      infrastructure: ["AWS S3 (recordings)", "Stripe"],
      tools: ["Simple-peer (WebRTC)", "FFmpeg (recording)", "JWT Auth"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Implemented WebRTC peer connection for live video sessions",
        "Built course creation flow with syllabus and schedule management",
        "Integrated Stripe for payment processing with escrow logic",
        "Created scheduling system with conflict detection",
        "Developed session recording pipeline using FFmpeg",
        "Built responsive UI with real-time session status"
      ],
      teamSize: "Solo project",
      duration: "5 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Beta Users", value: "40+", description: "Students and mentors" },
        { label: "Sessions Conducted", value: "25+", description: "Live mentorship sessions" },
        { label: "Avg Session Rating", value: "4.6/5", description: "Mentor quality score" },
        { label: "Booking Conversion", value: "68%", description: "From course view to enrollment" }
      ],
      impact: "Beta launched in college with 40+ users. Students appreciated flexible scheduling and affordable pricing (₹200-500 vs ₹5000+ for traditional courses). Mentors earned income while building teaching portfolios."
    },

    challenges: [
      {
        challenge: "WebRTC connection failures due to network issues",
        solution: "Implemented TURN server fallback and automatic reconnection with state recovery"
      },
      {
        challenge: "Session recording consuming server resources",
        solution: "Offloaded recording to background job queue, optimized FFmpeg encoding settings"
      },
      {
        challenge: "Ensuring mentor quality and preventing scams",
        solution: "Added verification process, first session money-back guarantee, escrow payment release"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/Skillnest",
      demo: null,
      demo_note: "Requires WebRTC support"
    },

    tags: ["React", "Node.js", "WebRTC", "Real-time", "EdTech"],
    updatedAt: "2026-04-12T17:39:43Z"
  },

  {
    id: "chatroom",
    name: "ChatRoom",
    tagline: "Real-Time Messaging with Rooms and Presence",
    badge: null,
    cover: "/chatroom-cover.svg",

    problem: {
      title: "Teams Need Lightweight Real-Time Communication",
      description: "Small teams and study groups need a simple, fast messaging solution without the complexity of Slack or the informality of WhatsApp. Existing solutions are either too feature-heavy or lack essential features like rooms, typing indicators, and message history.",
      painPoints: [
        "Slack/Discord are overkill for small teams",
        "WhatsApp lacks proper room organization",
        "No self-hosted option for privacy-conscious teams",
        "Difficult to search message history"
      ]
    },

    approach: {
      description: "Built a lightweight real-time chat application with Socket.io for instant messaging. Users create or join topic-based rooms, see who's online, get typing indicators, and access full message history. The UI is clean and distraction-free, focused on communication.",
      keyFeatures: [
        "Create public or private chat rooms by topic",
        "Real-time messaging with Socket.io",
        "Typing indicators and read receipts",
        "Online presence (who's active in each room)",
        "Message history with search functionality",
        "User authentication and room access control"
      ]
    },

    stack: {
      frontend: ["HTML", "CSS", "JavaScript", "Socket.io Client"],
      backend: ["Node.js", "Express", "Socket.io"],
      database: ["MongoDB"],
      infrastructure: [],
      tools: ["Bcrypt (auth)", "Moment.js (timestamps)"]
    },

    role: {
      title: "Full-Stack Developer",
      responsibilities: [
        "Built WebSocket server using Socket.io for real-time events",
        "Implemented room-based message broadcasting",
        "Created typing indicator system with debouncing",
        "Built presence detection (join/leave events, heartbeat)",
        "Designed message persistence with MongoDB",
        "Implemented user authentication with session management"
      ],
      teamSize: "Solo project",
      duration: "2 weeks"
    },

    outcomes: {
      metrics: [
        { label: "Message Latency", value: "<100ms", description: "Real-time delivery speed" },
        { label: "Concurrent Users", value: "50+", description: "Tested during demo" },
        { label: "Uptime", value: "99%+", description: "During 2-week test period" },
        { label: "Message Throughput", value: "500/min", description: "Peak load handled" }
      ],
      impact: "Used by study group for course project coordination. Students reported faster communication compared to email threads. Clean UI and instant delivery improved team collaboration."
    },

    challenges: [
      {
        challenge: "Scaling Socket.io connections beyond single server",
        solution: "Researched Redis adapter for horizontal scaling (not implemented in MVP)"
      },
      {
        challenge: "Message history loading performance with large rooms",
        solution: "Implemented pagination and infinite scroll with lazy loading"
      },
      {
        challenge: "Handling disconnections gracefully",
        solution: "Added automatic reconnection with missed message sync on reconnect"
      }
    ],

    links: {
      github: "https://github.com/aayush2724/chatRoom",
      demo: null,
      demo_note: "Requires Node.js server"
    },

    tags: ["Socket.io", "Node.js", "Express", "Real-time", "Chat"],
    updatedAt: "2026-02-23T17:10:54Z"
  }
];

// Helper to get case study by project ID
export function getCaseStudyById(id) {
  return caseStudies.find(cs => cs.id === id);
}

// Helper to get case study by project name
export function getCaseStudyByName(name) {
  return caseStudies.find(cs => cs.name === name);
}
