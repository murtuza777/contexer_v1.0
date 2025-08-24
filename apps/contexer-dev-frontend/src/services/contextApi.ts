// Context API service for frontend-backend communication
import useUserStore from '@/stores/userSlice';
import { ProjectContext, validateContextForUI } from '@/types/context';

const API_BASE = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
  message?: string;
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  context: ProjectContext;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  context: ProjectContext;
}

class ContextApiService {
  private getAuthHeaders() {
    const token = useUserStore.getState().token;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          errors: data.errors || [data.message || 'Request failed']
        };
      }
      
      return {
        success: true,
        data: data.project || data.projects || data.context || data
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Failed to parse response']
      };
    }
  }

  // Process README content (markdown) and return structured context + HTML
  async processReadme(content: string): Promise<ApiResponse<{ html: string; context: Partial<ProjectContext>; sections: { title: string; start: number; end: number }[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/readme/process`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          errors: errorData.errors || [errorData.message || 'Failed to process README']
        };
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to process README']
      };
    }
  }

  // Get all projects for current user
  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return this.handleResponse<Project[]>(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to fetch projects']
      };
    }
  }

  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      // Validate context before sending
      const validation = validateContextForUI(projectData.context);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const response = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData)
      });
      
      return this.handleResponse<Project>(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to create project']
      };
    }
  }

  // Get specific project
  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    try {
      const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return this.handleResponse<Project>(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to fetch project']
      };
    }
  }

  // Update project
  async updateProject(projectId: string, updates: Partial<CreateProjectRequest>): Promise<ApiResponse<Project>> {
    try {
      // Validate context if provided
      if (updates.context) {
        const validation = validateContextForUI(updates.context);
        if (!validation.isValid) {
          return {
            success: false,
            errors: validation.errors
          };
        }
      }

      const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      
      return this.handleResponse<Project>(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to update project']
      };
    }
  }

  // Save context for existing project
  async saveContext(projectId: string, context: ProjectContext): Promise<ApiResponse<Project>> {
    try {
      // Validate context before sending
      const validation = validateContextForUI(context);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const response = await fetch(`${API_BASE}/api/context/save`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          project_id: projectId,
          context
        })
      });
      
      return this.handleResponse<Project>(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to save context']
      };
    }
  }

  // Get context for project
  async getContext(projectId: string, includeVersions = false): Promise<ApiResponse<{
    context: ProjectContext;
    versions?: any[];
  }>> {
    try {
      const url = new URL(`${API_BASE}/api/context/get`);
      url.searchParams.set('project_id', projectId);
      if (includeVersions) {
        url.searchParams.set('include_versions', 'true');
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to fetch context']
      };
    }
  }

  // Delete project
  async deleteProject(projectId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        errors: ['Network error: Failed to delete project']
      };
    }
  }
}

// Export singleton instance
export const contextApi = new ContextApiService();
export default contextApi;

// Export types for use in components
export type { Project, CreateProjectRequest, ApiResponse };
