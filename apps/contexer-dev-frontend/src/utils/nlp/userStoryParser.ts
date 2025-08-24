import type { UserStory } from "@/types/context";

export interface ParsedStoryRaw {
  role: string;
  action: string;
  benefit?: string;
  acceptanceCriteria: string[];
  confidence: number; // 0..1
  startIndex: number;
  endIndex: number;
  raw: string;
}

// Regex patterns for user stories (allow "I can ..." and optional "to")
const STORY_REGEX = /\bAs\s+(?:an?|the)\s+([^,]+?),?\s+I\s+(?:(?:want|need|would\s+like|wish)(?:\s+to)?|can)\s+(.+?)(?:\s+so\s+that\s+([^\.\n\r]+))?(?:[\.|!]|\n|\r|$)/gi;

// Bullet/numbered acceptance criteria following a story
const BULLET_REGEX = /^(?:\s*[-*•]|\s*\d+\.)\s+(.+)$/i;

function scoreStory(role: string, action: string, benefit?: string): number {
  let score = 0;
  if (role.trim().length >= 3) score += 0.3;
  const wordCount = action.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 5) score += 0.4; else score += Math.min(0.4, wordCount * 0.06);
  if (benefit && benefit.trim().length >= 5) score += 0.2;
  return Math.min(1, Math.max(0, score));
}

export function parseUserStoriesRaw(input: string): ParsedStoryRaw[] {
  if (!input) return [];
  const text = input.toString();
  const results: ParsedStoryRaw[] = [];

  let match: RegExpExecArray | null;
  while ((match = STORY_REGEX.exec(text)) !== null) {
    const role = match[1]?.trim() || "";
    const action = match[2]?.trim() || "";
    const benefit = match[3]?.trim();
    const startIndex = match.index;
    const endIndex = STORY_REGEX.lastIndex;

    // Look ahead for acceptance criteria lines
    const after = text.slice(endIndex, endIndex + 1000); // scan a window
    const lines = after.split(/\r?\n/);
    const acceptance: string[] = [];
    for (const line of lines) {
      if (!line.trim()) {
        if (acceptance.length > 0) break; // stop at blank line after collecting some
        continue;
      }
      const m = line.match(BULLET_REGEX);
      if (m) {
        acceptance.push(m[1].trim());
        if (acceptance.length >= 5) break; // limit to 5
        continue;
      }
      // stop criteria block if non-bullet encountered after some bullets
      if (acceptance.length > 0) break;
      // else continue scanning in case bullets start a bit later
    }

    const confidence = scoreStory(role, action, benefit);
    results.push({ role, action, benefit, acceptanceCriteria: acceptance, confidence, startIndex, endIndex, raw: match[0] });
  }

  return results;
}

function enhanceAcceptanceDefaults(action: string): string[] {
  const normalized = action.replace(/\.$/, "").toLowerCase();
  return [
    `User can ${normalized}`,
    `Input validation exists for ${normalized}`,
    `Success and error states are handled for ${normalized}`
  ];
}

export function parseAndEnhanceUserStories(input: string): UserStory[] {
  const raw = parseUserStoriesRaw(input);
  const valid: ParsedStoryRaw[] = raw.filter(s => s.role.trim().length >= 3 && s.action.trim().split(/\s+/).filter(Boolean).length >= 2);

  const enhanced = (valid.length > 0 ? valid : []).map((s, idx) => {
    const descriptionParts = [
      `As a ${s.role}`,
      `I want to ${s.action}`,
      s.benefit ? `so that ${s.benefit}` : undefined
    ].filter(Boolean);
    const description = descriptionParts.join(", ") + ".";
    const ac = s.acceptanceCriteria.length > 0 ? s.acceptanceCriteria.slice(0, 5) : enhanceAcceptanceDefaults(s.action);
    return {
      id: `story_${idx + 1}`,
      description,
      acceptance_criteria: ac,
      status: "pending" as const,
      priority: "medium" as const,
      estimated_effort: "medium" as const
    } satisfies UserStory;
  });

  // Fallback: if no valid structured stories found, attempt to convert bullet lines into stories
  if (enhanced.length === 0) {
    const bulletLines = input
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => /^(-|\*|•|\d+\.)\s+/.test(l))
      .map(l => l.replace(/^(-|\*|•|\d+\.)\s+/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    if (bulletLines.length > 0) {
      return bulletLines.map((line, idx) => ({
        id: `story_${idx + 1}`,
        description: line.endsWith(".") ? line : `${line}.`,
        acceptance_criteria: [`Verify that ${line.toLowerCase()}`],
        status: "pending",
        priority: "medium",
        estimated_effort: "medium"
      }));
    }
  }

  return enhanced;
}


