export const MOCK_PRESETS = {
  beginner: {
    profile: {
      username: "alex-dev-starter",
      name: "Alex Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Learning CS | Python & JS enthusiast | Building cool stuff",
      publicRepos: 12,
      followers: 4,
      following: 10,
      createdAt: "2024-01-15T00:00:00Z"
    },
    scores: {
      overall: 48,
      technical: 52,
      documentation: 28,
      activity: 61,
      portfolio: 38
    },
    roast: {
      headline: "Your GitHub is like a graveyard of tutorials and 'temp-project-1' folders.",
      punchline: "You have 12 repositories, but a recruiter would spend 8 seconds here before assuming you stopped coding in February.",
      verdict: "Needs Immediate Rescue — High potential, zero presentation."
    },
    evidence: [
      { repo: "my-first-app", issue: "Missing README.md entirely", impact: "High" },
      { repo: "python-scripts", issue: "No commit activity in last 120 days", impact: "Medium" },
      { repo: "todo-list-v2", issue: "Generic boilerplate title with default create-react-app description", impact: "High" }
    ],
    rescuePlan: [
      {
        id: "task-1",
        priority: "HIGH",
        title: "Archive or Delete Unfinished Drafts",
        targetRepo: "my-first-app",
        action: "Clean up 5 repos that have fewer than 2 commits to highlight your actual work.",
        before: "# my-first-app\nA simple app.",
        after: "# DevTrack — Developer Activity Dashboard\n\nA lightweight React application that tracks local coding sessions with zero backend dependency.\n\n## Key Features\n- Session timer with auto-pause\n- LocalStorage metrics persistence\n- Sub-100ms render performance"
      },
      {
        id: "task-2",
        priority: "HIGH",
        title: "Overhaul Profile Bio & Contact Links",
        targetRepo: "Profile",
        action: "Add core skill stack tags and linked LinkedIn/portfolio URLs.",
        before: "Learning CS | Python & JS enthusiast | Building cool stuff",
        after: "CS Student @ PU | Full-Stack Web Developer (React, Node.js, Python)\nBuilding developer productivity tools | Open for Summer 2027 Internships"
      }
    ]
  },
  average: {
    profile: {
      username: "dev-sammy",
      name: "Samira Chen",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Full Stack Engineer | React, Python, PostgreSQL",
      publicRepos: 24,
      followers: 32,
      following: 28,
      createdAt: "2023-05-10T00:00:00Z"
    },
    scores: {
      overall: 71,
      technical: 78,
      documentation: 54,
      activity: 82,
      portfolio: 65
    },
    roast: {
      headline: "Solid code under the hood, but your READMEs read like a legal disclaimer.",
      punchline: "You have great technical depth, but you're forcing recruiters to guess how to run your code or what problem it solves.",
      verdict: "Recruiter Ready with Polish — Strong foundation, weak showcase."
    },
    evidence: [
      { repo: "e-commerce-api", issue: "No architecture diagram or setup steps in README", impact: "High" },
      { repo: "task-manager-ui", issue: "No live preview link or screenshots provided", impact: "Medium" }
    ],
    rescuePlan: [
      {
        id: "task-1",
        priority: "HIGH",
        title: "Add Visual Demos & Setup Guides to Top Repositories",
        targetRepo: "e-commerce-api",
        action: "Inject environment setup blocks, API endpoint specs, and response samples into README.md.",
        before: "# E-Commerce API\nBuilt with Express and MongoDB.",
        after: "# Node.js E-Commerce Microservice API\n\nHigh-performance REST API with JWT authentication, Stripe payment processing, and Webhook verification.\n\n## Quick Start\n```bash\nnpm install\ncp .env.example .env\nnpm run dev\n```\n\n## API Endpoints\n| Method | Endpoint | Description |\n|---|---|---|\n| POST | `/api/auth/login` | Authenticate user |\n| GET | `/api/products` | Fetch paginated catalog |"
      }
    ]
  },
  strong: {
    profile: {
      username: "dev-master-pro",
      name: "Rohan Varma",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      bio: "Open Source Contributor | Systems & Web Infrastructure | Rust & Go",
      publicRepos: 42,
      followers: 240,
      following: 45,
      createdAt: "2022-02-01T00:00:00Z"
    },
    scores: {
      overall: 93,
      technical: 96,
      documentation: 89,
      activity: 95,
      portfolio: 91
    },
    roast: {
      headline: "Your profile is so polished it makes the rest of us look like we're just pressing random keys.",
      punchline: "If a recruiter misses this profile, they should be audited instead.",
      verdict: "Top 1% Candidate — Immediate Interview Material."
    },
    evidence: [
      { repo: "rust-kv-store", issue: "Minor: Could benefit from benchmark results in README", impact: "Low" }
    ],
    rescuePlan: [
      {
        id: "task-1",
        priority: "LOW",
        title: "Benchmark Data Inclusion",
        targetRepo: "rust-kv-store",
        action: "Add Criterion.rs benchmark graphs to cement technical rigor.",
        before: "# KV Store\nIn-memory store written in Rust.",
        after: "# High-Throughput Rust Key-Value Store\n\nZero-copy, lock-free concurrent KV store achieving 1.2M req/sec.\n\n## Benchmarks\nTested on AMD Ryzen 9 5900X (Latency < 0.4ms at 99th percentile)."
      }
    ]
  }
};
