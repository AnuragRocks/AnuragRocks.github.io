/** Shared motion helpers. Every animation respects the visitor's reduced-motion setting. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  window.matchMedia("(hover:hover) and (pointer:fine)").matches;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const EMAIL = "anuragsharma2949@gmail.com";
export const RESUME_URL = "assets/Anurag_Sharma_Resume.pdf";

/** Role-specific résumés (same facts, ordered for the role). */
export const RESUMES = [
  { label: "Full-stack", href: "assets/Anurag_Sharma_Resume_FullStack.pdf" },
  { label: "Cloud & DevOps", href: "assets/Anurag_Sharma_Resume_Cloud_DevOps.pdf" },
] as const;
