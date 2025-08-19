// =============================================================================
// CONTEXER FRONTEND TYPES
// =============================================================================
// Frontend-only types for Context Composer UI components

export type UserStoryStatus = 'pending' | 'in_progress' | 'complete' | 'blocked';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type EstimatedEffort = 'small' | 'medium' | 'large' | 'extra_large';

export type ProjectType = 'web_app' | 'mobile_app' | 'desktop_app' | 'api' | 'library' | 'extension';

export type TechStack = 
  | 'React'
  | 'Next.js'
  | 'Vue.js'
  | 'Angular'
  | 'Node.js'
  | 'Express'
  | 'FastAPI'
  | 'Django'
  | 'Supabase'
  | 'PostgreSQL'
  | 'MongoDB'
  | 'TypeScript'
  | 'JavaScript'
  | 'Python'
  | 'Tailwind CSS'
  | 'Material-UI'
  | 'Chakra UI'
  | 'Redux'
  | 'Zustand'
  | 'React Query'
  | 'GraphQL'
  | 'REST API'
  | 'WebSocket'
  | 'PWA'
  | 'Docker'
  | 'AWS'
  | 'Vercel'
  | 'Netlify';

export type BrowserSupport = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Mobile Chrome' | 'Mobile Safari';

export type WCAGLevel = 'A' | 'AA' | 'AAA';

export interface UserStory {
  id: string;
  description: string;
  acceptance_criteria: string[];
  status: UserStoryStatus;
  priority?: Priority;
  estimated_effort?: EstimatedEffort;
}

export interface PerformanceConstraints {
  max_load_time?: number; // seconds
  target_users?: number;
}

export interface AccessibilityConstraints {
  wcag_level?: WCAGLevel;
  screen_reader_support?: boolean;
}

export interface SecurityConstraints {
  authentication_required?: boolean;
  data_encryption?: boolean;
  gdpr_compliance?: boolean;
}

export interface ProjectConstraints {
  performance?: PerformanceConstraints;
  browser_support?: BrowserSupport[];
  accessibility?: AccessibilityConstraints;
  security?: SecurityConstraints;
}

export interface ProjectContext {
  goal: string;
  user_stories: UserStory[];
  tech_stack: TechStack[];
  constraints?: ProjectConstraints;
  readme_content?: string;
  additional_notes?: string;
  project_type?: ProjectType;
  version?: string;
  created_at?: string;
  updated_at?: string;
}

// Legacy interface for backward compatibility with existing ContextComposer
export interface LegacyProjectContext {
  id: string;
  appDescription: string;
  techStack: string[];
  userStories: string;
  readme: string;
  constraints: string;
  lastUpdated: Date;
}

// Conversion functions between legacy and new format
export function convertLegacyToNewContext(legacy: LegacyProjectContext): ProjectContext {
  // Parse user stories from text format to structured format
  const userStoriesText = legacy.userStories?.trim() || '';
  const userStories: UserStory[] = [];
  
  if (userStoriesText) {
    const lines = userStoriesText.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      const cleanLine = line.replace(/^[-*]\s*/, '').trim();
      if (cleanLine) {
        userStories.push({
          id: `story_${index + 1}`,
          description: cleanLine,
          acceptance_criteria: [`Verify that ${cleanLine.toLowerCase()}`],
          status: 'pending' as const,
          priority: 'medium' as const,
          estimated_effort: 'medium' as const
        });
      }
    });
  }

  // Add default user story if none exist
  if (userStories.length === 0) {
    userStories.push({
      id: 'story_1',
      description: 'As a user, I want to use this application effectively',
      acceptance_criteria: ['User can access all main features'],
      status: 'pending' as const,
      priority: 'medium' as const,
      estimated_effort: 'medium' as const
    });
  }

  return {
    goal: legacy.appDescription || 'Project goal not specified',
    user_stories: userStories,
    tech_stack: (legacy.techStack || []) as TechStack[],
    readme_content: legacy.readme || '',
    additional_notes: legacy.constraints || '',
    project_type: 'web_app' as const,
    version: '1.0.0'
  };
}

export function convertNewToLegacyContext(context: ProjectContext): LegacyProjectContext {
  // Convert structured user stories back to text format
  const userStoriesText = context.user_stories
    ?.map(story => `- ${story.description}`)
    .join('\n') || '';

  return {
    id: 'current',
    appDescription: context.goal || '',
    techStack: context.tech_stack || [],
    userStories: userStoriesText,
    readme: context.readme_content || '',
    constraints: context.additional_notes || '',
    lastUpdated: new Date()
  };
}

// Frontend validation (basic checks for UI feedback)
export function validateContextForUI(context: Partial<ProjectContext>): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // Basic UI validation
  if (!context.goal || context.goal.trim().length < 10) {
    errors.push('Goal must be at least 10 characters long');
  }

  if (!context.user_stories || context.user_stories.length === 0) {
    errors.push('At least one user story is required');
  }

  if (!context.tech_stack || context.tech_stack.length === 0) {
    errors.push('At least one technology must be selected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Default context for new projects
export const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  goal: '',
  user_stories: [],
  tech_stack: [],
  project_type: 'web_app',
  version: '1.0.0'
};

// Common tech stack presets
export const TECH_STACK_PRESETS: Record<string, TechStack[]> = {
  'React Full Stack': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
  'Vue Full Stack': ['Vue.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
  'Simple React': ['React', 'JavaScript', 'Tailwind CSS'],
  'API Backend': ['Node.js', 'Express', 'TypeScript', 'PostgreSQL'],
  'Python Backend': ['Python', 'FastAPI', 'PostgreSQL']
};

// User story templates
export const USER_STORY_TEMPLATES: Partial<UserStory>[] = [
  {
    description: 'As a user, I want to sign up and log in so that I can access my personal dashboard',
    acceptance_criteria: [
      'User can register with email and password',
      'User can log in with valid credentials',
      'User stays logged in between sessions',
      'User can log out securely'
    ],
    priority: 'high',
    estimated_effort: 'medium'
  },
  {
    description: 'As a user, I want to create and manage items so that I can organize my work',
    acceptance_criteria: [
      'User can create new items with title and description',
      'User can edit existing items',
      'User can delete items',
      'Items are saved and persist between sessions'
    ],
    priority: 'high',
    estimated_effort: 'large'
  },
  {
    description: 'As a user, I want to search and filter items so that I can quickly find what I need',
    acceptance_criteria: [
      'User can search items by title or description',
      'User can filter items by category or status',
      'Search results are displayed in real-time',
      'User can clear search and filters'
    ],
    priority: 'medium',
    estimated_effort: 'medium'
  }
];
