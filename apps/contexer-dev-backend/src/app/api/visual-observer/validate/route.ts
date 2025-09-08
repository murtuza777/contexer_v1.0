// =============================================================================
// VISUAL OBSERVER BACKEND API
// =============================================================================
// Backend API endpoints for Visual Observer functionality

import { NextRequest, NextResponse } from 'next/server';
import { chromium, Browser, BrowserContext, Page } from 'playwright';

// Import the Visual Observer utilities
import { StoryMapper } from '../../../../utils/visual-observer/storyMapper';
import { ErrorIntegration } from '../../../../utils/visual-observer/errorIntegration';

interface TestAction {
  type: 'click' | 'fill' | 'expect' | 'navigate' | 'wait' | 'hover' | 'select';
  selector: string;
  value?: string;
  expected?: string;
  timeout?: number;
  description: string;
}

interface ValidationResult {
  storyId: string;
  criteriaResults: CriteriaResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  confidence: number;
  executionTime: number;
  screenshots: string[];
  errors: string[];
}

interface CriteriaResult {
  criteria: string;
  status: 'passed' | 'failed' | 'skipped';
  actions: TestAction[];
  error?: string;
  screenshot?: string;
  confidence: number;
}

class PlaywrightExecutor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async executeStory(story: any, projectUrl: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const criteriaResults: CriteriaResult[] = [];
    const screenshots: string[] = [];
    const errors: string[] = [];

    try {
      await this.initializeBrowser();
      await this.page?.goto(projectUrl);

      // Map story to test actions
      const testActions = StoryMapper.mapStoryToTests(story);
      
      // Execute each acceptance criteria
      for (const criteria of story.acceptance_criteria) {
        const criteriaResult = await this.validateCriteria(criteria, testActions);
        criteriaResults.push(criteriaResult);
        
        if (criteriaResult.screenshot) {
          screenshots.push(criteriaResult.screenshot);
        }
      }

      const executionTime = Date.now() - startTime;
      const overallStatus = this.determineOverallStatus(criteriaResults);
      const confidence = this.calculateOverallConfidence(criteriaResults);

      const result: ValidationResult = {
        storyId: story.id,
        criteriaResults,
        overallStatus,
        confidence,
        executionTime,
        screenshots,
        errors
      };

      // Process and emit errors
      const visualErrors = ErrorIntegration.processValidationErrors(result);
      ErrorIntegration.emitErrors(visualErrors);

      return result;

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
      return {
        storyId: story.id,
        criteriaResults,
        overallStatus: 'failed',
        confidence: 0,
        executionTime: Date.now() - startTime,
        screenshots,
        errors
      };
    } finally {
      await this.cleanup();
    }
  }

  private async validateCriteria(criteria: string, allActions: TestAction[]): Promise<CriteriaResult> {
    const relevantActions = allActions.filter(action => 
      action.description.toLowerCase().includes(criteria.toLowerCase()) ||
      criteria.toLowerCase().includes(action.description.toLowerCase())
    );

    if (relevantActions.length === 0) {
      return {
        criteria,
        status: 'skipped',
        actions: [],
        confidence: 0
      };
    }

    try {
      const results = await this.executeActions(relevantActions);
      const passed = results.every(result => result.success);
      
      return {
        criteria,
        status: passed ? 'passed' : 'failed',
        actions: relevantActions,
        confidence: this.calculateCriteriaConfidence(results),
        screenshot: passed ? undefined : await this.captureScreenshot()
      };
    } catch (error) {
      return {
        criteria,
        status: 'failed',
        actions: relevantActions,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0,
        screenshot: await this.captureScreenshot()
      };
    }
  }

  private async executeActions(actions: TestAction[]): Promise<Array<{ success: boolean; error?: string }>> {
    const results: Array<{ success: boolean; error?: string }> = [];

    for (const action of actions) {
      try {
        await this.executeAction(action);
        results.push({ success: true });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  private async executeAction(action: TestAction): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    const timeout = action.timeout || 10000;

    switch (action.type) {
      case 'click':
        await this.page.click(action.selector, { timeout });
        break;

      case 'fill':
        await this.page.fill(action.selector, action.value || '', { timeout });
        break;

      case 'expect':
        await this.expectElement(action);
        break;

      case 'navigate':
        if (action.value) {
          await this.page.goto(action.value);
        }
        break;

      case 'wait':
        await this.page.waitForTimeout(action.timeout || 1000);
        break;

      case 'hover':
        await this.page.hover(action.selector, { timeout });
        break;

      case 'select':
        if (action.value) {
          await this.page.selectOption(action.selector, action.value, { timeout });
        }
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async expectElement(action: TestAction): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    const { selector, expected } = action;
    const timeout = action.timeout || 10000;

    // Wait for element to be visible
    await this.page.waitForSelector(selector, { timeout });

    if (!expected) return;

    const expectedLower = expected.toLowerCase();

    if (expectedLower.includes('visible')) {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
    } else if (expectedLower.includes('hidden')) {
      await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    } else if (expectedLower.includes('enabled')) {
      const element = await this.page.$(selector);
      if (!element) throw new Error(`Element ${selector} not found`);
      const isDisabled = await element.isDisabled();
      if (isDisabled) throw new Error(`Element ${selector} is disabled`);
    } else if (expectedLower.includes('disabled')) {
      const element = await this.page.$(selector);
      if (!element) throw new Error(`Element ${selector} not found`);
      const isDisabled = await element.isDisabled();
      if (!isDisabled) throw new Error(`Element ${selector} is not disabled`);
    } else if (expectedLower.includes('text')) {
      const textContent = await this.page.textContent(selector);
      if (!textContent?.includes(expected)) {
        throw new Error(`Expected text "${expected}" not found in ${selector}`);
      }
    } else {
      // Default: check if element exists and is visible
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
    }
  }

  private async captureScreenshot(): Promise<string> {
    if (!this.page) return '';

    try {
      const timestamp = Date.now();
      const filename = `screenshot-${timestamp}.png`;
      const path = `test-results/${filename}`;
      
      await this.page.screenshot({ path, fullPage: true });
      return path;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return '';
    }
  }

  private async initializeBrowser(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(10000);
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      this.page = null;
      this.context = null;
      this.browser = null;
    }
  }

  private determineOverallStatus(results: CriteriaResult[]): 'passed' | 'failed' | 'partial' {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    if (failed === 0 && skipped === 0) return 'passed';
    if (passed === 0) return 'failed';
    return 'partial';
  }

  private calculateOverallConfidence(results: CriteriaResult[]): number {
    if (results.length === 0) return 0;
    
    const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / results.length;
  }

  private calculateCriteriaConfidence(results: Array<{ success: boolean; error?: string }>): number {
    if (results.length === 0) return 0;
    
    const successRate = results.filter(r => r.success).length / results.length;
    return successRate;
  }
}

// API Route: POST /api/visual-observer/validate
export async function POST(request: NextRequest) {
  try {
    // Set CORS headers explicitly for this route
    const corsHeaders = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      "Access-Control-Allow-Credentials": "true",
    });

    const { projectId, storyId, criteria, projectUrl = 'http://localhost:3000' } = await request.json();

    if (!storyId || !criteria) {
      return NextResponse.json(
        { error: 'Missing required fields: storyId, criteria' },
        { status: 400 }
      );
    }

    // Create a story object for the executor
    const story = {
      id: storyId,
      acceptance_criteria: criteria
    };

    // Execute validation
    const executor = new PlaywrightExecutor();
    const result = await executor.executeStory(story, projectUrl);

    return new NextResponse(JSON.stringify(result), { headers: corsHeaders });

  } catch (error) {
    console.error('Visual Observer validation error:', error);
    const corsHeaders = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      "Access-Control-Allow-Credentials": "true",
    });
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
}

// API Route: GET /api/visual-observer/results/:projectId
export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params;
    
    // TODO: Implement results retrieval from database
    // For now, return empty array
    return NextResponse.json([]);

  } catch (error) {
    console.error('Visual Observer results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    "Access-Control-Allow-Credentials": "true",
  });
  return new NextResponse(null, { status: 200, headers });
}
