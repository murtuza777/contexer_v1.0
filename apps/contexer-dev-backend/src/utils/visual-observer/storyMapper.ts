// =============================================================================
// STORY TO TEST MAPPING ENGINE (Backend)
// =============================================================================
// Converts user story acceptance criteria into Playwright test actions

export interface TestAction {
  type: 'click' | 'fill' | 'expect' | 'navigate' | 'wait' | 'hover' | 'select';
  selector: string;
  value?: string;
  expected?: string;
  timeout?: number;
  description: string;
}

export interface ElementDescription {
  text?: string;
  role?: string;
  type?: string;
  placeholder?: string;
  label?: string;
  testId?: string;
  className?: string;
  id?: string;
}

export interface UserStory {
  id: string;
  description: string;
  acceptance_criteria: string[];
  status: 'pending' | 'in_progress' | 'complete' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_effort?: 'small' | 'medium' | 'large' | 'extra_large';
}

export class StoryMapper {
  private static readonly ACTION_PATTERNS = {
    click: [
      /click\s+(?:on\s+)?(?:the\s+)?(.+?)(?:\s+button|\s+link|\s+element)?/i,
      /press\s+(?:the\s+)?(.+?)(?:\s+button)?/i,
      /tap\s+(?:on\s+)?(?:the\s+)?(.+?)/i,
      /select\s+(?:the\s+)?(.+?)(?:\s+option)?/i
    ],
    fill: [
      /fill\s+(?:in\s+)?(?:the\s+)?(.+?)(?:\s+field|\s+input)?/i,
      /enter\s+(?:the\s+)?(.+?)(?:\s+field|\s+input)?/i,
      /type\s+(?:in\s+)?(?:the\s+)?(.+?)(?:\s+field|\s+input)?/i,
      /input\s+(?:the\s+)?(.+?)(?:\s+field|\s+input)?/i
    ],
    expect: [
      /expect\s+(?:the\s+)?(.+?)(?:\s+to\s+)?(?:be\s+)?(.+?)/i,
      /see\s+(?:the\s+)?(.+?)(?:\s+to\s+)?(?:be\s+)?(.+?)/i,
      /verify\s+(?:that\s+)?(.+?)(?:\s+is\s+)?(.+?)/i,
      /check\s+(?:that\s+)?(.+?)(?:\s+is\s+)?(.+?)/i,
      /ensure\s+(?:that\s+)?(.+?)(?:\s+is\s+)?(.+?)/i
    ],
    navigate: [
      /navigate\s+(?:to\s+)?(?:the\s+)?(.+?)(?:\s+page)?/i,
      /go\s+(?:to\s+)?(?:the\s+)?(.+?)(?:\s+page)?/i,
      /visit\s+(?:the\s+)?(.+?)(?:\s+page)?/i,
      /open\s+(?:the\s+)?(.+?)(?:\s+page)?/i
    ]
  };

  private static readonly COMMON_SELECTORS = {
    button: [
      '[data-testid*="button"]',
      '[data-testid*="btn"]',
      'button',
      '[role="button"]',
      'input[type="submit"]',
      'input[type="button"]'
    ],
    input: [
      '[data-testid*="input"]',
      '[data-testid*="field"]',
      'input',
      'textarea',
      '[role="textbox"]'
    ],
    link: [
      '[data-testid*="link"]',
      'a',
      '[role="link"]'
    ],
    form: [
      '[data-testid*="form"]',
      'form'
    ]
  };

  static mapStoryToTests(story: UserStory): TestAction[] {
    const actions: TestAction[] = [];
    
    for (const criteria of story.acceptance_criteria) {
      const mappedActions = this.mapCriteriaToActions(criteria);
      actions.push(...mappedActions);
    }
    
    return actions;
  }

  private static mapCriteriaToActions(criteria: string): TestAction[] {
    const actions: TestAction[] = [];
    const normalizedCriteria = criteria.toLowerCase().trim();

    for (const [actionType, patterns] of Object.entries(this.ACTION_PATTERNS)) {
      for (const pattern of patterns) {
        const match = normalizedCriteria.match(pattern);
        if (match) {
          const action = this.createActionFromMatch(
            actionType as TestAction['type'],
            match,
            criteria
          );
          if (action) {
            actions.push(action);
            break;
          }
        }
      }
    }

    if (actions.length === 0) {
      actions.push({
        type: 'expect',
        selector: 'body',
        expected: 'page loaded',
        description: criteria,
        timeout: 5000
      });
    }

    return actions;
  }

  private static createActionFromMatch(
    actionType: TestAction['type'],
    match: RegExpMatchArray,
    originalCriteria: string
  ): TestAction | null {
    const [, element, expected] = match;
    
    if (!element) return null;

    const selector = this.generateSelector(element.trim(), actionType);
    
    const action: TestAction = {
      type: actionType,
      selector,
      description: originalCriteria,
      timeout: 10000
    };

    switch (actionType) {
      case 'fill':
        action.value = this.extractValueFromCriteria(originalCriteria);
        break;
      case 'expect':
        action.expected = expected || this.extractExpectedValue(originalCriteria);
        break;
      case 'navigate':
        action.value = element;
        break;
    }

    return action;
  }

  private static generateSelector(elementDescription: string, actionType: TestAction['type']): string {
    const normalized = elementDescription.toLowerCase().trim();
    
    const testIdSelector = this.generateTestIdSelector(normalized);
    if (testIdSelector) return testIdSelector;

    const ariaSelector = this.generateAriaSelector(normalized);
    if (ariaSelector) return ariaSelector;

    const textSelector = this.generateTextSelector(normalized);
    if (textSelector) return textSelector;

    return this.getFallbackSelector(actionType);
  }

  private static generateTestIdSelector(elementDescription: string): string | null {
    const testIdMap: Record<string, string> = {
      'login': '[data-testid*="login"]',
      'email': '[data-testid*="email"]',
      'password': '[data-testid*="password"]',
      'submit': '[data-testid*="submit"]',
      'cancel': '[data-testid*="cancel"]',
      'save': '[data-testid*="save"]',
      'delete': '[data-testid*="delete"]',
      'edit': '[data-testid*="edit"]',
      'create': '[data-testid*="create"]',
      'search': '[data-testid*="search"]',
      'filter': '[data-testid*="filter"]',
      'menu': '[data-testid*="menu"]',
      'dropdown': '[data-testid*="dropdown"]',
      'modal': '[data-testid*="modal"]',
      'form': '[data-testid*="form"]'
    };

    for (const [key, selector] of Object.entries(testIdMap)) {
      if (elementDescription.includes(key)) {
        return selector;
      }
    }

    return null;
  }

  private static generateAriaSelector(elementDescription: string): string | null {
    return `[aria-label*="${elementDescription}"]`;
  }

  private static generateTextSelector(elementDescription: string): string | null {
    if (elementDescription.includes('button') || elementDescription.includes('link')) {
      return `text="${elementDescription}"`;
    }
    return null;
  }

  private static getFallbackSelector(actionType: TestAction['type']): string {
    const fallbacks = this.COMMON_SELECTORS;
    
    switch (actionType) {
      case 'click':
        return fallbacks.button[0];
      case 'fill':
        return fallbacks.input[0];
      case 'expect':
        return 'body';
      case 'navigate':
        return 'body';
      default:
        return 'body';
    }
  }

  private static extractValueFromCriteria(criteria: string): string {
    const quotedMatch = criteria.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];

    const testValues = ['test@example.com', 'test123', 'sample', 'demo'];
    for (const value of testValues) {
      if (criteria.toLowerCase().includes(value)) {
        return value;
      }
    }

    return 'test value';
  }

  private static extractExpectedValue(criteria: string): string {
    const expectedStates = [
      'visible', 'hidden', 'enabled', 'disabled', 'selected', 'checked',
      'success', 'error', 'loading', 'complete', 'active', 'inactive'
    ];

    for (const state of expectedStates) {
      if (criteria.toLowerCase().includes(state)) {
        return state;
      }
    }

    return 'present';
  }

  static canMapStory(story: UserStory): boolean {
    return story.acceptance_criteria && story.acceptance_criteria.length > 0;
  }

  static getMappingConfidence(story: UserStory): number {
    if (!this.canMapStory(story)) return 0;

    let confidence = 0;
    const criteria = story.acceptance_criteria;

    for (const criterion of criteria) {
      const actions = this.mapCriteriaToActions(criterion);
      
      for (const action of actions) {
        if (action.selector.includes('data-testid')) {
          confidence += 0.3;
        } else if (action.selector.includes('aria-label')) {
          confidence += 0.2;
        } else if (action.selector.includes('text=')) {
          confidence += 0.1;
        } else {
          confidence += 0.05;
        }
      }
    }

    return Math.min(1, confidence / criteria.length);
  }
}
