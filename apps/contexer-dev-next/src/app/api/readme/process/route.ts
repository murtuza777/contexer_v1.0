import { NextRequest, NextResponse } from 'next/server';
import type { TechStack, UserStory, ProjectContext } from '@/types/context';

type Section = { title: string; start: number; end: number };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Very basic markdown to HTML, supports headers, lists, code fences, paragraphs
function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let inCode = false;
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      if (!inCode) {
        inCode = true;
        out.push('<pre><code>');
      } else {
        inCode = false;
        out.push('</code></pre>');
      }
      continue;
    }
    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      if (inList) { out.push('</ul>'); inList = false; }
      const level = h[1].length;
      out.push(`<h${level}>${escapeHtml(h[2].trim())}</h${level}>`);
      continue;
    }
    if (/^(?:\s*[-*]|\s*\d+\.)\s+/.test(line)) {
      if (!inList) { out.push('<ul>'); inList = true; }
      const item = line.replace(/^(?:\s*[-*]|\s*\d+\.)\s+/, '');
      out.push(`<li>${escapeHtml(item)}</li>`);
      continue;
    }
    if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('');
      continue;
    }
    // paragraph
    if (inList) { out.push('</ul>'); inList = false; }
    out.push(`<p>${escapeHtml(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

// Section detection by markdown headings
function detectSections(md: string): Section[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const sections: Section[] = [];
  let current: Section | null = null;
  let offset = 0; // running character index
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      if (current) {
        current.end = offset - 1; // end just before this heading
        sections.push(current);
      }
      current = { title: m[2].trim(), start: offset + line.length + 1, end: md.length };
    }
    offset += line.length + 1; // + newline
  }
  if (current) {
    current.end = md.length;
    sections.push(current);
  }
  if (sections.length === 0) {
    sections.push({ title: 'Introduction', start: 0, end: md.length });
  }
  return sections;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Basic tech detector (subset) for backend use
function detectTechFromText(text: string): TechStack[] {
  const found: Set<TechStack> = new Set();
  const add = (cond: RegExp, tech: TechStack) => { if (cond.test(text)) found.add(tech); };
  add(/next\s*(?:\.\s*js|js)?\s*15\b/i, 'Next.js');
  add(/\bnext(?:\s*\.\s*js|js)?\b/i, 'Next.js');
  add(/react\s*18\b/i, 'React');
  add(/\breact\b/i, 'React');
  add(/vue\s*3\b/i, 'Vue.js');
  add(/\bvue\b/i, 'Vue.js');
  add(/\bangular\b/i, 'Angular');
  add(/node\b/i, 'Node.js');
  add(/express\b/i, 'Express');
  add(/fast\s*api|fastapi/i, 'FastAPI');
  add(/django/i, 'Django');
  add(/supabase/i, 'Supabase');
  add(/postgres\w*/i, 'PostgreSQL');
  add(/mongo\w*/i, 'MongoDB');
  add(/typescript|\bts\b/i, 'TypeScript');
  add(/javascript|\bjs\b/i, 'JavaScript');
  add(/python/i, 'Python');
  add(/tailwind/i, 'Tailwind CSS');
  add(/material[-\s]?ui|\bmui\b/i, 'Material-UI');
  add(/chakra\s*ui|\bchakra\b/i, 'Chakra UI');
  return Array.from(found);
}

// Story regex similar to frontend (allow "I can ..." and optional "to")
const STORY_REGEX = /\bAs\s+(?:an?|the)\s+([^,]+?),?\s+I\s+(?:(?:want|need|would\s+like|wish)(?:\s+to)?|can)\s+(.+?)(?:\s+so\s+that\s+([^\.\n\r]+))?(?:[\.|!]|\n|\r|$)/gi;
const BULLET_REGEX = /^(?:\s*[-*•]|\s*\d+\.)\s+(.+)$/i;

function parseStories(md: string): UserStory[] {
  const text = md;
  const stories: UserStory[] = [];
  let m: RegExpExecArray | null;
  const used = new Set<string>();
  while ((m = STORY_REGEX.exec(text)) !== null) {
    const role = m[1]?.trim() || '';
    const action = m[2]?.trim() || '';
    const benefit = m[3]?.trim();
    const desc = `As a ${role}, I want to ${action}${benefit ? ` so that ${benefit}` : ''}.`;
    if (used.has(desc)) continue;
    used.add(desc);
    // find bullets after
    const after = text.slice(STORY_REGEX.lastIndex, STORY_REGEX.lastIndex + 800);
    const lines = after.split(/\r?\n/);
    const ac: string[] = [];
    for (const line of lines) {
      if (!line.trim()) { if (ac.length > 0) break; else continue; }
      const b = line.match(BULLET_REGEX);
      if (b) { ac.push(b[1].trim()); if (ac.length >= 5) break; continue; }
      if (ac.length > 0) break;
    }
    stories.push({ id: `story_${stories.length + 1}`, description: desc, acceptance_criteria: ac.length ? ac : [`User can ${action}.`], status: 'pending', priority: 'medium', estimated_effort: 'medium' });
  }
  // If none, try converting feature bullets into stories
  if (stories.length === 0) {
    const bullets = text.split(/\r?\n/).map(l => l.trim()).filter(l => /^(-|\*|•|\d+\.)\s+/.test(l)).map(l => l.replace(/^(-|\*|•|\d+\.)\s+/, '')).slice(0, 5);
    for (const b of bullets) {
      const desc = b.endsWith('.') ? b : `${b}.`;
      stories.push({ id: `story_${stories.length + 1}`, description: desc, acceptance_criteria: [`Verify that ${b.toLowerCase()}`], status: 'pending', priority: 'medium', estimated_effort: 'medium' });
    }
  }
  return stories;
}

function extractGoal(md: string, sections: Section[]): string {
  const intro = sections.find(s => /^(introduction|overview|about|summary)$/.test(normalizeTitle(s.title))) || sections[0];
  const text = md.slice(0, Math.min(md.length, intro.end)).slice(intro.start ? intro.start : 0);
  const sentences = text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const filtered = sentences.filter(s => !/^(this\s+project|a\s+simple|sample|boilerplate|readme)/i.test(s.trim()));
  return filtered.slice(0, 3).join(' ').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content: string = body?.content || '';
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'content is required' }, { status: 400 });
    }

    const sections = detectSections(content);
    const html = markdownToHtml(content);
    const stories = parseStories(content);
    const techs = detectTechFromText(content);
    const goal = extractGoal(content, sections);

    const context: Partial<ProjectContext> = {
      goal,
      user_stories: stories,
      tech_stack: techs
    };

    return NextResponse.json({ success: true, html, context, sections });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}


