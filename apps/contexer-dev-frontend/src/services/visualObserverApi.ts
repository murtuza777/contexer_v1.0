// =============================================================================
// VISUAL OBSERVER API SERVICE
// =============================================================================
// API endpoints for Visual Observer functionality

import { ValidationResult, ValidationHistory } from '@/types/visualObserver';

const API_BASE_URL = (() => {
  // Try to detect backend URL dynamically
  const commonBackendPorts = [3000, 3001, 8000, 4000];
  const baseUrl = 'http://localhost';
  
  // For now, use the most common Next.js port
  return `${baseUrl}:3000/api/visual-observer`;
})();

export class VisualObserverApi {
  /**
   * Detects the running project URL
   */
  static async detectProjectUrl(): Promise<string> {
    const commonPorts = [5173, 3000, 3001, 8080, 4000];
    const baseUrl = 'http://localhost';
    
    for (const port of commonPorts) {
      try {
        const response = await fetch(`${baseUrl}:${port}`, { 
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(1000)
        });
        return `${baseUrl}:${port}`;
      } catch (error) {
        // Continue to next port
        continue;
      }
    }
    
    // Default fallback
    return 'http://localhost:5173';
  }

  /**
   * Validates a user story against a project
   */
  static async validateStory(
    projectId: string,
    storyId: string,
    criteria: string[],
    projectUrl?: string
  ): Promise<ValidationResult> {
    // Use provided URL or detect dynamically
    const targetUrl = projectUrl || await VisualObserverApi.detectProjectUrl();
    
    const response = await fetch(`${API_BASE_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        storyId,
        criteria,
        projectUrl: targetUrl
      })
    });

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets validation results for a project
   */
  static async getValidationResults(projectId: string): Promise<ValidationResult[]> {
    const response = await fetch(`${API_BASE_URL}/results/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gets validation history for a project
   */
  static async getValidationHistory(projectId: string): Promise<ValidationHistory[]> {
    const response = await fetch(`${API_BASE_URL}/history/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Saves validation results
   */
  static async saveValidationResults(
    projectId: string,
    results: ValidationResult
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        results
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save results: ${response.statusText}`);
    }
  }

  /**
   * Gets project URL for validation
   */
  static async getProjectUrl(projectId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/project-url/${projectId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get project URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  }

  /**
   * Checks if project is ready for validation
   */
  static async isProjectReady(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ready/${projectId}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
