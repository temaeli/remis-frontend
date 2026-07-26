import { Injectable } from '@angular/core';
import { Workflow } from '@shared/components/workflows';

@Injectable({ providedIn: 'root' })
export class HseWorkflowService {
  private workflows: Workflow[] = [
    {
      name: 'Incident Management',
      description:
        'Report, review and escalate HSE incidents up the approval ladder; investigation team performs RCA and assigns corrective actions.',
      steps: [
        {
          stepId: 1,
          role: 'Gasco Staff',
          action: 'Fills incident form and submits to shift supervisor',
          nextStep: 'Shift Supervisor review',
          systemBehavior:
            'Report created in DRAFT; creator may edit and attach evidence, affected personnel and affected assets while draft.',
        },
        {
          stepId: 2,
          role: 'Shift Supervisor',
          action: 'Reviews reported incident and forwards to HSE Officer',
          alternativeActions: 'Reject / rollback to Gasco Staff for correction',
          nextStep: 'HSE Officer review',
          systemBehavior: null,
        },
        {
          stepId: 3,
          role: 'HSE Officer',
          action:
            'Reviews reported incident, forms investigation team if necessary, and forwards to Manager',
          alternativeActions: 'Reject / rollback',
          nextStep: 'Manager review',
          systemBehavior:
            'Investigation team can be formed on any incident; team members inherit view+update on the incident.',
        },
        {
          stepId: 4,
          role: 'Manager',
          action: 'Reviews severity and impact; submits to General Manager',
          alternativeActions: 'Reject / rollback',
          nextStep: 'General Manager endorsement',
          systemBehavior: null,
        },
        {
          stepId: 5,
          role: 'General Manager',
          action: 'Reviews and endorses the proposed action',
          alternativeActions: 'Reject / rollback',
          nextStep: 'Investigation & Corrective Actions',
          systemBehavior: 'Incident status flips to APPROVED once endorsed by GM.',
        },
        {
          stepId: 6,
          role: 'Investigation Team',
          action:
            'Conducts Root Cause Analysis; corrective actions assigned to responsible persons and tracked to completion',
          nextStep: null,
          systemBehavior:
            'Corrective actions have due dates + completedAt; the incident is closed when all corrective actions are marked completed.',
        },
      ],
      rules: [
        'Only the creator may edit the report while it is still in DRAFT / at Gasco Staff stage.',
        'Once submitted, only the current-actor role in the ladder can act; any other role sees read-only.',
        'A reject at any stage rolls the report back to the previous actor (status ROLLED_BACK) for correction.',
        'Investigation Team may be formed by HSE Officer at any stage; members can update the incident and log corrective actions but not approve.',
        'Every action button is gated on both permission (ROLE_APPROVE_REPORTED_INCIDENT, etc.) AND being the current actor.',
      ],
    },
    {
      name: 'HSE Training',
      description:
        'Schedule HSE training plans, capture attendance and external attendee registrations, and generate the periodic training report.',
      steps: [
        {
          stepId: 1,
          role: 'HSE Officer',
          action: 'Schedules the training plan; reviews training data; submits to Manager',
          nextStep: 'Manager review & approval',
          systemBehavior: null,
        },
        {
          stepId: 2,
          role: 'Manager',
          action: 'Reviews and approves the training plan',
          alternativeActions: 'Reject / return to HSE Officer for revision',
          nextStep: 'External-attendee registration',
          systemBehavior: null,
        },
        {
          stepId: 3,
          role: 'HSE Officer',
          action: 'Registers training data for external attendees (e.g. contractors)',
          nextStep: 'Attendee data entry',
          systemBehavior:
            'Internal staff are pulled from UAA; external attendees are added inline via the attendees tab.',
        },
        {
          stepId: 4,
          role: 'Gasco Staff',
          action: 'Fills own training attendance data (attended / not attended, comments)',
          nextStep: 'HSE Officer review',
          systemBehavior: null,
        },
        {
          stepId: 5,
          role: 'HSE Officer',
          action: 'Reviews training data and submits to Manager for close-out',
          nextStep: 'Report generation',
          systemBehavior: null,
        },
        {
          stepId: 6,
          role: 'System',
          action: 'Generates the training report (PDF)',
          nextStep: null,
          systemBehavior:
            'Report merges plan details, attendee list, attendance % and attachments into a downloadable PDF.',
        },
      ],
      rules: [
        'Training plan cannot be edited once approved by Manager; edits require a rollback.',
        'External attendees are stored on the training itself, not in the user directory.',
        'ROLE_EXECUTE_HSE_TRAINING is what lets attendees mark their own attendance.',
      ],
    },
    {
      name: 'HSE Meeting',
      description:
        'Schedule HSE meetings, send invitations, capture minutes and attendance, and route minutes to the Head of Department for approval.',
      steps: [
        {
          stepId: 1,
          role: 'HSE Officer',
          action:
            'Schedules meeting (title, category, chair, secretary, agenda, attendees) and confirms to send email invitations',
          nextStep: 'Meeting held & marked completed',
          systemBehavior:
            'On Confirm, invitations are emailed to every attendee whose contact is a valid email; Resend Invitations is available afterwards.',
        },
        {
          stepId: 2,
          role: 'HSE Officer',
          action:
            'Marks meeting completed with remarks, uploads minutes + attendance attachments, submits to Head of Department',
          nextStep: 'HoD approval',
          systemBehavior:
            'Meeting status flips COMPLETED; completedAt + completedBy stamped; minutes/attendance grids unlock.',
        },
        {
          stepId: 3,
          role: 'Head of Department',
          action: 'Approves the meeting minutes with a comment',
          alternativeActions: 'Reject minutes with comment (returns to HSE Officer)',
          nextStep: 'Report generation',
          systemBehavior:
            'Approve stamps approvedAt + actedBy; Reject stamps rejectedAt and re-opens minutes/attendance for revision.',
        },
        {
          stepId: 4,
          role: 'System',
          action: 'Auto-generates the meeting report (PDF)',
          nextStep: null,
          systemBehavior:
            'Report is compiled from title, chair, secretary, agendas (ordered by indexOrder), attendee list + attendance and approved minutes.',
        },
      ],
      rules: [
        'Only scheduled meetings can be confirmed; only confirmed meetings can be marked completed.',
        'Only completed meetings can be approved or rejected by Head of Department.',
        'ROLE_APPROVE_HSE_MEETING_MINUTES is the sole gate for the Approve / Reject buttons.',
        'Agenda rows are ordered by indexOrder ASC everywhere they appear (grid, invitation email, report).',
      ],
    },
    {
      name: 'HSE Drill',
      description:
        'Schedule emergency drills, capture observations and action plans, and route through review and endorsement.',
      steps: [
        {
          stepId: 1,
          role: 'HSE Officer',
          action: 'Schedules the drill plan (financial year, quarter, category, date, location)',
          nextStep: 'Shift Supervisor review',
          systemBehavior: 'Drill created in DRAFT; attachments can be uploaded pre-submission.',
        },
        {
          stepId: 2,
          role: 'Shift Supervisor',
          action: 'Reviews the drill plan and submits to the respective Manager',
          alternativeActions: 'Reject / rollback to HSE Officer',
          nextStep: 'Manager endorsement',
          systemBehavior: 'reviewedAt / reviewedBy stamped on submit.',
        },
        {
          stepId: 3,
          role: 'Manager',
          action: 'Reviews and endorses the drill plan',
          alternativeActions: 'Reject / rollback',
          nextStep: 'HSE data entry',
          systemBehavior: 'endorsedAt / endorsedBy stamped; drill unlocks for data entry.',
        },
        {
          stepId: 4,
          role: 'HSE Officer',
          action:
            'Enters drill data: description, observation, recommendation, supervisor & manager comments, action plans',
          nextStep: 'Report generation',
          systemBehavior:
            'Action plans get action, assignee, assignee-as, duration in days and completedAt; the drill is closed when all action plans are completed.',
        },
        {
          stepId: 5,
          role: 'System',
          action: 'Generates the drill report (PDF)',
          nextStep: null,
          systemBehavior:
            'Report is built from drill details, attachments (list) and action plans (assignees + completion state).',
        },
      ],
      rules: [
        'Drill plan can only be edited by the current-stage actor; other stages see read-only.',
        'ROLE_ENTER_HSE_DRILL_DATA is required for the post-endorsement data-entry stage (typically HSE Officer).',
        'Attachment deletion is gated separately (ROLE_DELETE_DRILL_PLAN) and reserved for HSE Officer.',
      ],
    },
    {
      name: 'Inspection Management',
      description:
        'Schedule inspection plans, execute checklists, upload evidence, raise corrective actions, and close or escalate findings.',
      steps: [
        {
          stepId: 1,
          role: 'HSE Officer',
          action: 'Schedules inspection plan and submits to Manager for approval',
          nextStep: 'Manager approval',
          systemBehavior:
            'Plan carries inspection type, checklist template, scheduled date and assigned inspector.',
        },
        {
          stepId: 2,
          role: 'HSE Officer',
          action:
            'Records findings, provides recommendations and submits to Manager',
          nextStep: 'Checklist execution',
          systemBehavior: null,
        },
        {
          stepId: 3,
          role: 'Inspector / HSE Officer',
          action: 'Uploads evidence and completes the inspection checklist',
          nextStep: 'Corrective actions',
          systemBehavior:
            'ROLE_EXECUTE_INSPECTION_PLAN is required; checklist items are tied to the plan\'s inspection type template.',
        },
        {
          stepId: 4,
          role: 'Inspector / HSE Officer',
          action: 'Assigns corrective actions to responsible persons',
          nextStep: 'Close-out',
          systemBehavior:
            'Corrective actions inherit due dates + completedAt; assignees receive a notification.',
        },
        {
          stepId: 5,
          role: 'HSE Officer',
          action: 'Reviews inspection and closes or escalates via the action tracker',
          alternativeActions: 'Escalate to Manager if a finding cannot be closed locally',
          nextStep: null,
          systemBehavior:
            'Close stamps closedAt on the plan; escalation reopens the finding under Manager view for follow-up.',
        },
      ],
      rules: [
        'Only HSE Officer holds ROLE_MANAGE_INSPECTION_PLANS (schedule + assign inspector); Inspectors only execute.',
        'A plan cannot be closed while any linked corrective action is still open.',
        'Inspection Type and Checklist catalogs are HSE Officer-managed and shared across all plans.',
      ],
    },
    {
      name: 'Environment Management',
      description:
        'Multi-actor daily data-entry flow for emissions, fuel, water, energy and waste; HSE Officer approves each log and the system compiles regulatory reports.',
      steps: [
        {
          stepId: 1,
          role: 'Control Room Engineer',
          action: 'Fills flared gas & fuel gas data on the Emission Log (Plant)',
          nextStep: 'HSE Officer approval',
          systemBehavior:
            'Formula-based calculations run in-form; entry lands in EMISSION_LOG with PENDING approval.',
        },
        {
          stepId: 2,
          role: 'Administrative Officer / Stores Officer',
          action:
            'Fills diesel & petrol data on the Emission Log (Kinyerezi via Admin Officer, Plant via Stores Officer)',
          nextStep: 'HSE Officer approval',
          systemBehavior: null,
        },
        {
          stepId: 3,
          role: 'Water Technician',
          action: 'Fills water usage data on the Water Usage Log',
          nextStep: 'HSE Officer approval',
          systemBehavior: null,
        },
        {
          stepId: 4,
          role: 'Power Generation Operator / Administrative Officer',
          action:
            'Fills energy data on the Energy Usage Log (Plant via Power Gen Operator, Kinyerezi via Admin Officer)',
          nextStep: 'HSE Officer approval',
          systemBehavior: null,
        },
        {
          stepId: 5,
          role: 'HSE Officer',
          action: 'Fills waste data on the Waste Generation Log and approves every submitted log',
          alternativeActions: 'Reject a submitted log for correction',
          nextStep: 'Compliance analysis & regulatory report',
          systemBehavior:
            'Approval flips the log to APPROVED and locks it; rejection returns it to the original submitter.',
        },
        {
          stepId: 6,
          role: 'System',
          action: 'Analyses recorded data against compliance limits and compiles regulatory reports',
          nextStep: null,
          systemBehavior:
            'Exceedance of a compliance limit raises an alert; regulatory reports are generated per period from approved logs.',
        },
      ],
      rules: [
        'Log entries (WATER_USAGE, ENERGY_USAGE, WASTE_GENERATION_LOG, EMISSION_LOG) require APPROVE by HSE Officer to be counted.',
        'Catalog entities (WATER_USE, ENERGY_USE, WASTE_GROUP, WASTE_CATEGORY, EMISSION_SUBSTANCE) are managed by HSE Officer only — no approval workflow.',
        'A user without HSE_MODULE cannot open any of these log or catalog surfaces even if they hold the individual perms.',
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
