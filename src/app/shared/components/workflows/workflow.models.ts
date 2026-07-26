export interface WorkflowStep {
  stepId: number;
  role: string;
  action: string;
  alternativeActions?: string | string[];
  nextStep: string | null;
  systemBehavior: string | null;
}

export interface WorkflowRule {
  rule: string;
}

export interface Workflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
  rules: WorkflowRule[] | string[];
}
