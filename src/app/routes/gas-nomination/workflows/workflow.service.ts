import { Injectable } from '@angular/core';
import { Workflow } from '@shared/components/workflows';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private workflows: Workflow[] = [
    {
      name: 'Customer Registration',
      description:
        'Process for registering a new customer account, including GSA creation, review, and approval.',
      steps: [
        {
          stepId: 1,
          role: 'Distribution  Engineer',
          action: 'Creates GSA',
          nextStep: 'Submit GSA to Head of Operation',
          systemBehavior: null,
        },
        {
          stepId: 2,
          role: 'Head of Operation',
          action: 'Review GSA',
          nextStep: 'Submit GSA to Distribution Manager',
          systemBehavior: null,
        },
        {
          stepId: 3,
          role: 'Distribution  Manager',
          action: 'Approve & Activate customer account registration',
          alternativeActions: [
            'Reject customer account registration',
            'Terminate customer account registration',
          ],
          nextStep: 'Completion & Notification',
          systemBehavior: null,
        },
        {
          stepId: 4,
          role: 'System',
          action: 'Send notification',
          nextStep: null,
          systemBehavior:
            'Notification sent to customer, DPB Officer, DPB Manager after process completion',
        },
      ],
      rules: [
        'Upstreamer registration requires approval',
        'GSA check is required before activation of customer account registration',
      ],
    },
    {
      name: 'Nomination Process',
      description:
        'Process for downstreamer nomination submission, review, approval, and transmission to upstreamer.',
      steps: [
        {
          stepId: 1,
          role: 'Downstreamer Customer',
          action: 'Makes nomination and submits via system',
          nextStep: 'System auto-fill and send',
          systemBehavior:
            'System automatically fills nomination value into downstreamer\'s nomination letter template and sends to upstreamer via email and system',
        },
        {
          stepId: 2,
          role: 'Pipeline Shift Supervisor',
          action: 'Reviews all nominations and aggregates nominations',
          nextStep: 'Submits nominations to Pipeline Manager',
          systemBehavior: null,
        },
        {
          stepId: 3,
          role: 'Pipeline Manager',
          action: 'Review and approve nomination',
          nextStep: 'Submits nominations to Plant Shift Supervisor',
          systemBehavior: null,
        },
        {
          stepId: 4,
          role: 'Plant Shift Supervisor',
          action: 'Review nomination received',
          alternativeActions:
            'If any issue, comment and return back to Pipeline Shift Supervisor for modification (Plant Manager will be notified)',
          nextStep: 'Submit nomination to Plant Superintendent',
          systemBehavior: null,
        },
        {
          stepId: 5,
          role: 'Plant Superintendent',
          action: 'Review nomination',
          nextStep: 'Submit nomination to Plant Manager',
          systemBehavior: null,
        },
        {
          stepId: 6,
          role: 'Plant Manager',
          action: 'Review and approve nomination and submit to Upstreamer Customer',
          alternativeActions:
            'If Plant Manager unavailable, Plant Superintendent carries out Plant Manager duties including sending nomination to Upstreamer',
          nextStep: 'Nomination sent to Upstreamer Customer',
          systemBehavior:
            'Nomination value automatically filled in nomination letter template. Plant Superintendent/Plant Manager can preview and send the letter to Upstreamer Customer.',
        },
      ],
      rules: [
        'If Plant Manager is unavailable or absent for a certain period, Plant Superintendent carries out Plant Manager duties including sending nomination to upstreamer',
        'System automatically fills nomination values in nomination letter templates for both downstreamer and upstreamer',
        'Plant Manager or Plant Superintendent must preview nomination letter before sending to upstreamer',
      ],
    },
  ];

  getWorkflows(): Workflow[] {
    return this.workflows;
  }

  getWorkflowByName(name: string): Workflow | undefined {
    return this.workflows.find((w) => w.name === name);
  }
}
