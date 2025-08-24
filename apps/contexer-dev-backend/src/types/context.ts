// =============================================================================
// CONTEXER BACKEND TYPES
// =============================================================================
// Backend-only types for API endpoints and database operations

export type ProjectStatus = 'draft' | 'building' | 'error' | 'complete' | 'paused';

export type UserStoryStatus = 'pending' | 'in_progress' | 'complete' | 'blocked';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type EstimatedEffort = 'small' | 'medium' | 'large' | 'extra_large';

export type ProjectType = 'web_app' | 'mobile_app' | 'desktop_app' | 'api' | 'library' | 'extension';

export type DeploymentTarget = 'vercel' | 'netlify' | 'aws' | 'azure' | 'gcp' | 'heroku' | 'self_hosted';

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
  deployment_target?: DeploymentTarget;
  version?: string;
  created_at?: string;
  updated_at?: string;
}

// Database types for Supabase
export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  context: ProjectContext;
  terminal_logs?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAgentMemory {
  id: string;
  project_id: string;
  state: 'idle' | 'building' | 'validating' | 'error' | 'fixing' | 'approval' | 'complete';
  last_error?: string;
  fix_suggestion?: string;
  memory_data: Record<string, any>;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseErrorFix {
  id: string;
  project_id: string;
  error_hash: string;
  error_message: string;
  error_type?: string;
  diff?: string;
  fix_suggestion?: string;
  applied: boolean;
  approved_by?: string;
  success_rate: number;
  created_at: string;
  applied_at?: string;
}

export interface DatabaseFeatureValidation {
  id: string;
  project_id: string;
  feature_name: string;
  user_story_id?: string;
  validation_status: 'pending' | 'passed' | 'failed' | 'manual_review';
  validation_data: Record<string, any>;
  screenshot_url?: string;
  validation_notes?: string;
  created_at: string;
  validated_at?: string;
}

export interface DatabaseBuildLog {
  id: string;
  project_id: string;
  log_level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  error_detected: boolean;
  timestamp: string;
}

export interface DatabaseContextVersion {
  id: string;
  project_id: string;
  version_number: number;
  context_data: ProjectContext;
  change_summary?: string;
  created_by?: string;
  created_at: string;
}

// API request/response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  context: ProjectContext;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  context?: ProjectContext;
  status?: ProjectStatus;
}

export interface SaveContextRequest {
  project_id: string;
  context: ProjectContext;
}

export interface SaveContextResponse {
  success: boolean;
  project: DatabaseProject;
  version_created: boolean;
  errors?: string[];
}

export interface GetContextResponse {
  success: boolean;
  context: ProjectContext;
  versions?: DatabaseContextVersion[];
  errors?: string[];
}

// Backend validation function (comprehensive schema validation)
export function validateProjectContext(context: Partial<ProjectContext>): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  // Required fields
  if (!context.goal || context.goal.trim().length < 10) {
    errors.push('Goal must be at least 10 characters long');
  }

  if (context.goal && context.goal.length > 2000) {
    errors.push('Goal must be less than 2000 characters');
  }

  if (!context.user_stories || context.user_stories.length === 0) {
    errors.push('At least one user story is required');
  }

  if (!context.tech_stack || context.tech_stack.length === 0) {
    errors.push('At least one technology must be selected');
  }

  // Validate user stories
  if (context.user_stories) {
    context.user_stories.forEach((story, index) => {
      if (!story.id || !story.id.trim()) {
        errors.push(`User story ${index + 1} must have an ID`);
      }
      if (!story.description || story.description.trim().length < 10) {
        errors.push(`User story ${index + 1} description must be at least 10 characters`);
      }
      if (story.description && story.description.length > 500) {
        errors.push(`User story ${index + 1} description must be less than 500 characters`);
      }
      if (!story.acceptance_criteria || story.acceptance_criteria.length === 0) {
        errors.push(`User story ${index + 1} must have acceptance criteria`);
      }
      if (!['pending', 'in_progress', 'complete', 'blocked'].includes(story.status)) {
        errors.push(`User story ${index + 1} has invalid status`);
      }
    });
  }

  // Validate tech stack
  if (context.tech_stack) {
    const validTechStack = [
      'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'FastAPI', 'Django',
      'Supabase', 'PostgreSQL', 'MongoDB', 'TypeScript', 'JavaScript', 'Python',
      'Tailwind CSS', 'Material-UI', 'Chakra UI', 'Redux', 'Zustand', 'React Query',
      'GraphQL', 'REST API', 'WebSocket', 'PWA', 'Docker', 'AWS', 'Vercel', 'Netlify'
    ];
    
    const invalidTech = context.tech_stack.filter(tech => !validTechStack.includes(tech));
    if (invalidTech.length > 0) {
      errors.push(`Invalid technologies: ${invalidTech.join(', ')}`);
    }
  }

  // Validate optional fields
  if (context.readme_content && context.readme_content.length > 50000) {
    errors.push('README content must be less than 50,000 characters');
  }

  if (context.additional_notes && context.additional_notes.length > 5000) {
    errors.push('Additional notes must be less than 5,000 characters');
  }

  if (context.project_type && !['web_app', 'mobile_app', 'desktop_app', 'api', 'library', 'extension'].includes(context.project_type)) {
    errors.push('Invalid project type');
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

// Helper function to sanitize context data before storing
export function sanitizeProjectContext(context: ProjectContext): ProjectContext {
  return {
    ...context,
    goal: context.goal?.trim() || '',
    user_stories: context.user_stories?.map(story => ({
      ...story,
      id: story.id.trim(),
      description: story.description.trim(),
      acceptance_criteria: story.acceptance_criteria.map(criteria => criteria.trim())
    })) || [],
    readme_content: context.readme_content?.trim(),
    additional_notes: context.additional_notes?.trim(),
    updated_at: new Date().toISOString()
  };
}
