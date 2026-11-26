export type CaseStudy = {
  slug: string;
  title: string;
  kicker: string;
  when: string;
  role: string;
  summary: string;
  problem: string[];
  flow: Array<{ label: string; sub: string }>;
  built: Array<{ title: string; text: string }>;
  hard: Array<{ title: string; text: string }>;
  results: string[];
  stack: string[];
  repo?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "rodent-care",
    title: "Rodent Care Records Platform",
    kicker: "Full-stack + DevOps · University of Windsor",
    when: "Sep – Oct 2026",
    role: "Sole owner, from requirements to production",
    summary:
      "An animal care digitisation platform for the University of Windsor's Office of Research and Innovation. It replaces paper records with a React web app, an Android app built with Capacitor, and a Node.js API on PostgreSQL.",
    problem: [
      "Animal care records were kept on paper and in scattered spreadsheets, which made audits slow and data easy to lose.",
      "The platform had to work on the web and on tablets in the facility, keep strict role-based access, and be maintainable by a small team after I hand it over.",
      "Requirements came from weekly meetings with directors, the Vice-President and the Chair, so priorities changed and the release process had to be safe to run often.",
    ],
    flow: [
      { label: "React + Capacitor", sub: "Web app and Android app" },
      { label: "Node.js API", sub: "Helmet, rate limits, JWT, RBAC" },
      { label: "PostgreSQL", sub: "Prisma migrations" },
      { label: "GitHub Actions", sub: "Postgres 16 service container" },
      { label: "Vercel + Render", sub: "Frontend and API hosting" },
    ],
    built: [
      { title: "CI that tests against a real database", text: "Every push and pull request starts a Postgres 16 service container in GitHub Actions, applies the Prisma migrations, builds the API and runs Vitest and Supertest integration tests against it." },
      { title: "Small, safe containers", text: "The API ships as a multi-stage Docker image that runs as a non-root user, with a Docker Compose stack for local development that matches production." },
      { title: "Security by default", text: "Helmet headers, rate limiting, bcrypt password hashing, JWT sessions and role-based access control on every route." },
      { title: "Notifications and AI features", text: "I built the notification system and integrated AI capabilities into the web and Android apps." },
    ],
    hard: [
      { title: "Reverse-proxy crash in production", text: "After deployment the API crashed behind the hosting provider's reverse proxy. I diagnosed the crash in production logs and fixed the configuration so the API runs reliably behind the proxy." },
      { title: "SPA routes returning 404", text: "Deep links worked locally but returned 404 in production. I added rewrite rules so every client-side route falls back to the app shell." },
    ],
    results: [
      "One pipeline takes every change from push to tested build",
      "Web and Android ship from one codebase",
      "Hardened API with security middleware on every route",
    ],
    stack: ["React", "Capacitor", "Node.js", "PostgreSQL", "Prisma", "Docker", "GitHub Actions", "Vercel", "Render"],
  },
  {
    slug: "acare",
    title: "ACare Aquatic Facility Platform",
    kicker: "Full-stack + DevOps · Monorepo",
    when: "Jul – Aug 2026",
    role: "Designed the architecture and co-built the release pipelines",
    summary:
      "A platform for running an aquatic facility, built as a monorepo with a FastAPI backend, a React/Vite frontend, MongoDB Atlas and an Android tablet app. It has role-based access and audit logging throughout.",
    problem: [
      "Staff needed one system on desktop and on tablets, with a clear record of who changed what.",
      "Tablets had to receive updates reliably without someone reinstalling the app by hand.",
      "Releases had to be verifiable, so a corrupted or tampered bundle could never reach a device.",
    ],
    flow: [
      { label: "React / Vite", sub: "Web app and tablet UI" },
      { label: "FastAPI", sub: "RBAC and audit logging" },
      { label: "MongoDB Atlas", sub: "Managed database" },
      { label: "GitHub Actions", sub: "OTA and APK workflows" },
      { label: "GitHub Releases", sub: "Checksummed bundles" },
    ],
    built: [
      { title: "Monorepo architecture", text: "I designed the layout so the API, web app and Android shell share types and tooling and can be released together." },
      { title: "Over-the-air updates", text: "A GitHub Actions workflow builds the web bundle, computes a SHA-256 checksum and publishes both to GitHub Releases, so tablets can verify an update before applying it." },
      { title: "Signed Android builds", text: "A second workflow builds the APK, signs it and verifies the signature before it is published." },
      { title: "Ops runbook", text: "The stack runs in Docker Compose locally and on Render, Vercel and MongoDB Atlas in production, with a runbook for deploys and recovery." },
    ],
    hard: [
      { title: "Trusting updates on shared tablets", text: "Checksums and signature checks in CI meant the app only applies bundles that match what the pipeline built." },
      { title: "Accountability", text: "Audit logging at the API layer records every change with the user and role that made it." },
    ],
    results: [
      "Over-the-air updates for the tablet app",
      "Every release is checksummed and signed",
      "Clear audit trail for every change",
    ],
    stack: ["FastAPI", "React", "Vite", "MongoDB Atlas", "Capacitor", "Docker", "GitHub Actions", "Render", "Vercel"],
  },
];
