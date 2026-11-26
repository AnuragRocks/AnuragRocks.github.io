/**
 * DevOps notes. Each block is a paragraph, a heading (## ...), a code block (``` ...) or a list (- ...).
 * Add a new note by adding an entry here; it shows up on the home page and gets its own page.
 */
export type Note = { slug: string; title: string; date: string; read: string; tags: string[]; blurb: string; body: string[] };

export const NOTES: Note[] = [
  {
    slug: "postgres-service-container-ci",
    title: "Integration tests against a real Postgres in GitHub Actions",
    date: "2026-10-20",
    read: "4 min",
    tags: ["GitHub Actions", "PostgreSQL", "Prisma"],
    blurb: "Mocks hide migration bugs. A service container gives every pull request a throwaway Postgres 16 to test against.",
    body: [
      "Unit tests with a mocked database are fast, but they never catch a migration that fails or a query that only breaks on real Postgres. On the Rodent Care platform I wanted every push to run the API against the same database engine it uses in production.",
      "## The service container",
      "GitHub Actions can start a container next to the job. The health check matters: without it, the tests can start before Postgres accepts connections.",
      "```yaml\nservices:\n  postgres:\n    image: postgres:16\n    env:\n      POSTGRES_USER: test\n      POSTGRES_PASSWORD: test\n      POSTGRES_DB: app_test\n    ports: [\"5432:5432\"]\n    options: >-\n      --health-cmd pg_isready\n      --health-interval 5s\n      --health-timeout 5s\n      --health-retries 10",
      "## Migrate, build, test",
      "```yaml\n- run: npm ci\n- run: npx prisma migrate deploy\n  env:\n    DATABASE_URL: postgresql://test:test@localhost:5432/app_test\n- run: npm run build\n- run: npx vitest run",
      "Running `prisma migrate deploy` in CI means a broken migration fails the pull request instead of the deploy. Supertest then calls the real Express app, so the tests cover routing, middleware and SQL together.",
      "## What I'd tell my past self",
      "- Keep the test database name obviously fake so nobody points tests at production.",
      "- Reset tables between test files, not between tests, to keep the suite fast.",
      "- Cache `~/.npm`, not `node_modules`, so `npm ci` stays reproducible.",
    ],
  },
  {
    slug: "multi-stage-non-root-docker",
    title: "Smaller, safer Node images with multi-stage builds",
    date: "2026-10-02",
    read: "3 min",
    tags: ["Docker", "Node.js", "Security"],
    blurb: "Build tools stay in the first stage, and the image that ships runs as a user who can't write to the app.",
    body: [
      "A single-stage Node image ships compilers, dev dependencies and your source maps, and it runs as root by default. Two stages fix both problems.",
      "```dockerfile\nFROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build && npm prune --omit=dev\n\nFROM node:20-alpine\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=build --chown=node:node /app/node_modules ./node_modules\nCOPY --from=build --chown=node:node /app/dist ./dist\nUSER node\nEXPOSE 3000\nCMD [\"node\", \"dist/server.js\"]",
      "## Why it matters",
      "- The final image only has what runs in production, so it is smaller and pulls faster.",
      "- `USER node` means a bug in the app can't rewrite system files in the container.",
      "- `npm prune --omit=dev` in the build stage keeps test tools out of the runtime image.",
      "Pair it with a Compose file that uses the same image locally, and \"works on my machine\" stops being a category of bug.",
    ],
  },
  {
    slug: "runbook-scripts",
    title: "Turning incident steps into scripts",
    date: "2026-09-12",
    read: "3 min",
    tags: ["Linux", "On-call", "Automation"],
    blurb: "How writing down what I typed during incidents, then scripting it, cut resolution time from hours to minutes.",
    body: [
      "As a Cloud Service Engineer I noticed that most incidents started with the same ten minutes of checks: disk, memory, failing services, recent deploys, error spikes in the logs. I wrote more than twenty small scripts for those checks, and resolution time dropped from about two hours to fifteen minutes.",
      "## Start with a first-look script",
      "```bash\n#!/usr/bin/env bash\nset -euo pipefail\necho \"== host ==\"; hostname; uptime\necho \"== disk ==\"; df -h | awk '$5+0 > 80'\necho \"== memory ==\"; free -m\necho \"== failed units ==\"; systemctl --failed --no-legend\necho \"== recent errors ==\"; journalctl -p err --since '30 min ago' --no-pager | tail -n 20",
      "## Rules I follow",
      "- Read-only first. A diagnostic script should never change the system.",
      "- Print what is wrong, not everything. Filters like `$5+0 > 80` keep the output short at 3 a.m.",
      "- Link every script from the runbook entry for the alert that needs it.",
      "Automation like this pairs well with monitoring: the alert says something is wrong, and the script tells you where to look.",
    ],
  },
];
