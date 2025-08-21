// Simple Tech Stack Detector with pattern library, scoring, and validation
import type { TechStack } from "@/types/context";

export type TechId =
  | "next"
  | "react"
  | "vue"
  | "angular"
  | "node"
  | "express"
  | "django"
  | "fastapi"
  | "supabase"
  | "postgresql"
  | "mongodb"
  | "typescript"
  | "javascript"
  | "python"
  | "tailwind"
  | "mui"
  | "chakra";

export interface TechPattern {
  id: TechId;
  canonical: TechStack;
  label: string;
  regexes: RegExp[];
}

// Pattern library with common variations and typos
const patterns: TechPattern[] = [
  {
    id: "next",
    canonical: "Next.js",
    label: "Next.js",
    regexes: [
      /next\s*\.\s*js\s*15\b/i,
      /next\s*15\b/i,
      /nextjs\s*15\b/i,
      /next\s*\.\s*js\b/i,
      /nextjs\b/i,
      /next\s*js\b/i,
      /nexjs\b/i // common typo
    ]
  },
  {
    id: "react",
    canonical: "React",
    label: "React",
    regexes: [
      /react\s*18\b/i,
      /react18\b/i,
      /react\b/i,
      /create-?react-?app\b/i,
      /\bcra\b/i
    ]
  },
  {
    id: "vue",
    canonical: "Vue.js",
    label: "Vue.js",
    regexes: [/vue\s*3\b/i, /vue3\b/i, /vue\s*\.\s*js\b/i, /vue\b/i]
  },
  {
    id: "angular",
    canonical: "Angular",
    label: "Angular",
    regexes: [/angular\s*\d+\b/i, /angular\b/i, /\bng\b/i]
  },
  { id: "node", canonical: "Node.js", label: "Node.js", regexes: [/node\s*\.\s*js\b/i, /node\b/i] },
  { id: "express", canonical: "Express", label: "Express", regexes: [/express\b/i] },
  { id: "django", canonical: "Django", label: "Django", regexes: [/django\b/i] },
  { id: "fastapi", canonical: "FastAPI", label: "FastAPI", regexes: [/fast\s*api\b/i, /fastapi\b/i] },
  { id: "supabase", canonical: "Supabase", label: "Supabase", regexes: [/supabase\b/i] },
  { id: "postgresql", canonical: "PostgreSQL", label: "PostgreSQL", regexes: [/postgres\w*\b/i] },
  { id: "mongodb", canonical: "MongoDB", label: "MongoDB", regexes: [/mongo\w*\b/i] },
  { id: "typescript", canonical: "TypeScript", label: "TypeScript", regexes: [/typescript\b/i, /ts\b/i] },
  { id: "javascript", canonical: "JavaScript", label: "JavaScript", regexes: [/javascript\b/i, /\bjs\b/i] },
  { id: "python", canonical: "Python", label: "Python", regexes: [/python\b/i] },
  { id: "tailwind", canonical: "Tailwind CSS", label: "Tailwind CSS", regexes: [/tailwind\b/i] },
  { id: "mui", canonical: "Material-UI", label: "Material-UI", regexes: [/material[-\s]?ui\b/i, /\bmui\b/i] },
  { id: "chakra", canonical: "Chakra UI", label: "Chakra UI", regexes: [/chakra\s*ui\b/i, /\bchakra\b/i] }
];

export interface DetectedTech {
  id: TechId;
  canonical: TechStack;
  label: string;
  version?: string;
  score: number; // 0..1
  matches: string[];
  firstIndex: number; // earliest match index
}

const APPROVED: TechStack[] = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express",
  "FastAPI",
  "Django",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "TypeScript",
  "JavaScript",
  "Python",
  "Tailwind CSS",
  "Material-UI",
  "Chakra UI",
  "Redux",
  "Zustand",
  "React Query",
  "GraphQL",
  "REST API",
  "WebSocket",
  "PWA",
  "Docker",
  "AWS",
  "Vercel",
  "Netlify"
];

const FALLBACK: TechStack = "Next.js";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function extractVersion(id: TechId, text: string): string | undefined {
  switch (id) {
    case "next": {
      const m = text.match(/next(?:\s*\.\s*js|js|\s*js)?\s*(\d{1,2})\b/i);
      return m?.[1];
    }
    case "react": {
      const m = text.match(/react\s*(\d{1,2})\b/i);
      return m?.[1];
    }
    case "vue": {
      const m = text.match(/vue\s*(\d{1,2})\b/i);
      return m?.[1];
    }
    case "angular": {
      const m = text.match(/angular\s*(\d{1,2})\b/i);
      return m?.[1];
    }
    default:
      return undefined;
  }
}

export function detectTechStack(input: string): DetectedTech | null {
  if (!input || !input.trim()) return null;
  const text = input.toString();
  const totalLen = text.length || 1;

  let best: DetectedTech | null = null;

  for (const p of patterns) {
    const matches: string[] = [];
    let earliest = Infinity;
    let count = 0;

    for (const rx of p.regexes) {
      const regex = new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : rx.flags + "g");
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        matches.push(m[0]);
        earliest = Math.min(earliest, m.index);
        count++;
      }
    }

    if (count === 0) continue;

    const matchedLen = matches.reduce((acc, s) => acc + s.length, 0);
    const coverage = clamp01(matchedLen / Math.min(totalLen, 200)); // cap denominator to reduce long-text penalty

    const positionBonus = clamp01(1 - earliest / Math.max(totalLen, 1)); // earlier => closer to 1
    const density = clamp01(count / 5); // cap at 5 occurrences

    // version bonus if present
    const version = extractVersion(p.id, text);
    const versionBonus = version ? 0.1 : 0;

    // Weighted score
    const score = clamp01(0.45 * coverage + 0.35 * density + 0.2 * positionBonus + versionBonus);

    const detected: DetectedTech = {
      id: p.id,
      canonical: p.canonical,
      label: p.label,
      version,
      score,
      matches,
      firstIndex: isFinite(earliest) ? earliest : totalLen
    };

    if (!best || detected.score > best.score) best = detected;
  }

  return best;
}

export function validateCanonicalTech(tech: string | undefined): TechStack {
  if (tech && (APPROVED as string[]).includes(tech)) return tech as TechStack;
  return FALLBACK;
}

export interface DetectionOutcome {
  detected: DetectedTech | null;
  recommended: TechStack; // validated canonical with fallback
}

export function recommendTechFromText(input: string, threshold = 0.3): DetectionOutcome {
  const detected = detectTechStack(input);
  if (!detected) return { detected: null, recommended: FALLBACK };
  if (detected.score >= threshold) return { detected, recommended: validateCanonicalTech(detected.canonical) };
  return { detected, recommended: FALLBACK };
}


