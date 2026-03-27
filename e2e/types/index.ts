export interface AIVisionResult {
  passed: boolean;
  score: number;
  dimensionScores?: {
    themeStyle: number;
    layout: number;
    color: number;
    text: number;
    interaction: number;
  };
  issues: string[];
  suggestions: string[];
}

export interface DesignRequirement {
  name: string;
  criteria: string[];
  expectedElements?: string[];
  forbiddenElements?: string[];
}

export interface TestScenario {
  name: string;
  path: string;
  actions: TestAction[];
  validations: ValidationStep[];
}

export interface TestAction {
  type: 'click' | 'fill' | 'navigate' | 'wait';
  target?: string;
  value?: string;
  delay?: number;
}

export interface ValidationStep {
  type: 'screenshot' | 'element' | 'ai-analysis';
  selector?: string;
  requirement: DesignRequirement;
}

export interface TestReport {
  scenario: string;
  passed: boolean;
  screenshots: string[];
  aiResults: AIVisionResult[];
  duration: number;
  timestamp: string;
}
