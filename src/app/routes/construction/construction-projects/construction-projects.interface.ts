import { SubWard } from '@routes/settings/regions/subward/subward.form';

export interface Contractor {
  uid: string;
  code?: string;
  name: string;
  registrationNumber?: string;
  tin?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
}

export enum ConstructionProjectStatus {
  REGISTERED = 'REGISTERED',
  PLANNING = 'PLANNING',
  ONGOING = 'ONGOING',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ConstructionActivityStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum ConstructionMilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
}

export enum ConstructionConstraintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ConstructionImpactLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DistributionReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface WorkflowActionDtoInput {
  uid: string;
  comments?: string;
}

export interface ConstructionProject {
  uid: string;
  code: string;
  name: string;
  contractNumber?: string;
  clientName?: string;
  owner?: string;
  consultant?: string;
  contractAmount?: string;
  contractor?: Contractor;
  subWard?: SubWard;
  physicalAddress?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  description?: string;
  requireActivityDates?: boolean;
  status: ConstructionProjectStatus;
  progressPercent?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConstructionProjectDtoInput {
  uid?: string;
  name: string;
  contractNumber?: string;
  clientName?: string;
  /** Carried onto the monthly report so it need not be re-typed each month. */
  owner?: string;
  consultant?: string;
  contractAmount?: string;
  /** Link an existing contractor by uid; or supply contractorName to auto-create one. */
  contractorUid?: string;
  contractorName?: string;
  subWardUid?: string;
  physicalAddress?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  description?: string;
  requireActivityDates?: boolean;
  status?: ConstructionProjectStatus;
}

export interface ConstructionCategory {
  uid: string;
  project?: ConstructionProject;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  weight?: number;
  orderIndex?: number;
  progressPercent?: number;
  active?: boolean;
}

export interface ConstructionCategoryDtoInput {
  uid?: string;
  projectUid: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  weight?: number;
  orderIndex?: number;
}

export interface ConstructionActivity {
  uid: string;
  category?: ConstructionCategory;
  parentActivity?: ConstructionActivity;
  name: string;
  description?: string;
  unitOfMeasure?: string;
  startDate?: string;
  endDate?: string;
  plannedQuantity?: number;
  completedQuantity?: number;
  weight?: number;
  status?: ConstructionActivityStatus;
  orderIndex?: number;
  progressPercent?: number;
  active?: boolean;
}

export interface ConstructionActivityDtoInput {
  uid?: string;
  categoryUid: string;
  parentActivityUid?: string;
  name: string;
  description?: string;
  unitOfMeasure?: string;
  startDate?: string;
  endDate?: string;
  plannedQuantity?: number;
  completedQuantity?: number;
  weight?: number;
  status?: ConstructionActivityStatus;
  orderIndex?: number;
}

export interface ConstructionMilestone {
  uid: string;
  project?: ConstructionProject;
  activity?: ConstructionActivity;
  name: string;
  description?: string;
  targetDate?: string;
  status?: ConstructionMilestoneStatus;
  orderIndex?: number;
  progressPercent?: number;
  active?: boolean;
}

export interface ConstructionMilestoneDtoInput {
  uid?: string;
  activityUid: string;
  name: string;
  description?: string;
  targetDate?: string;
  status?: ConstructionMilestoneStatus;
  orderIndex?: number;
}

export interface ConstructionDailyProgress {
  uid: string;
  activity?: ConstructionActivity;
  project?: ConstructionProject;
  reportDate: string;
  cumulativeQuantity?: number;
  previousCumulativeQuantity?: number;
  dailyQuantity?: number;
  note?: string;
  active?: boolean;
}

export interface ConstructionDailyProgressDtoInput {
  uid?: string;
  activityUid: string;
  reportDate: string;
  cumulativeQuantity?: number;
  previousCumulativeQuantity?: number;
  note?: string;
}

export interface ConstructionDailyReport {
  uid: string;
  project?: ConstructionProject;
  projectName?: string;
  reportDate: string;
  weather?: string;
  workforceCount?: number;
  workforceNotes?: string;
  visitors?: string;
  workPerformed?: string;
  quantitiesCompleted?: string;
  hseObservations?: string;
  qualityControl?: string;
  challenges?: string;
  correctiveActions?: string;
  planForNextDay?: string;
  subContractor?: string;
  financier?: string;
  toolBoxMeeting?: string;
  staffAtSite?: string;
  projectProgressPercent?: number;
  status: DistributionReportStatus;
  preparedByName?: string;
  checkedByName?: string;
  approvedByName?: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  active?: boolean;
}

export interface ConstructionDailyReportDtoInput {
  uid?: string;
  projectUid: string;
  reportDate: string;
  weather?: string;
  workforceCount?: number;
  workforceNotes?: string;
  visitors?: string;
  workPerformed?: string;
  quantitiesCompleted?: string;
  hseObservations?: string;
  qualityControl?: string;
  challenges?: string;
  correctiveActions?: string;
  planForNextDay?: string;
  subContractor?: string;
  financier?: string;
  toolBoxMeeting?: string;
  staffAtSite?: string;
  /** Per-row entries scoped to this report; no projectUid/uid (project is inferred from the parent report). */
  manpower?: ConstructionDailyManpowerEntryDtoInput[];
  /** Reused as-is from the standalone Constraint entity, including projectUid/uid. */
  constraints?: ConstructionConstraintDtoInput[];
  /** Per-activity cumulative progress readings as at this report date; reused as-is from the standalone Daily Progress entity. */
  dailyProgress?: ConstructionDailyProgressDtoInput[];
  /** Site photos / supporting documents (generic attachments). */
  attachments?: any[];
}

/** Stripped manpower row scoped to a single daily report (no projectUid); write-only, not returned by the API. */
export interface ConstructionDailyManpowerEntryDtoInput {
  entryDate?: string;
  workforceCategory?: string;
  personnelCount?: number;
  hoursPerDay?: number;
  note?: string;
}

export interface ConstructionManpowerEntry {
  uid: string;
  project?: ConstructionProject;
  entryDate: string;
  workforceCategory?: string;
  personnelCount?: number;
  hoursPerDay?: number;
  manHours?: number;
  note?: string;
  active?: boolean;
}

export interface ConstructionManpowerEntryDtoInput {
  uid?: string;
  projectUid: string;
  entryDate: string;
  workforceCategory?: string;
  personnelCount?: number;
  hoursPerDay?: number;
  note?: string;
}

export interface ConstructionManHourCategorySummary {
  workforceCategory?: string;
  personnelDays?: number;
  manHours?: number;
}

export interface ConstructionManHourSummary {
  projectUid?: string;
  fromDate?: string;
  toDate?: string;
  totalManHours?: number;
  totalPersonnelDays?: number;
  byCategory?: ConstructionManHourCategorySummary[];
}

export interface ConstructionConstraint {
  uid: string;
  project?: ConstructionProject;
  title?: string;
  constraintType?: string;
  description: string;
  impactLevel?: ConstructionImpactLevel;
  responsiblePerson?: string;
  mitigationAction?: string;
  status?: ConstructionConstraintStatus;
  raisedDate?: string;
  targetResolutionDate?: string;
  resolvedDate?: string;
  active?: boolean;
}

export interface ConstructionConstraintDtoInput {
  uid?: string;
  projectUid: string;
  title?: string;
  constraintType?: string;
  description: string;
  impactLevel?: ConstructionImpactLevel;
  responsiblePerson?: string;
  mitigationAction?: string;
  status?: ConstructionConstraintStatus;
  raisedDate?: string;
  targetResolutionDate?: string;
  resolvedDate?: string;
}

/** Read-only attachment shape returned by the construction `*Attachments` queries. */
export interface ConstructionAttachment {
  uid: string;
  attachmentTitle?: string;
  filePath?: string;
  mediaSize?: number;
  mediaType?: string;
  model?: string;
  sourceId?: string;
  sourceName?: string;
}

/**
 * Aggregate view of a single daily report: its own fields plus the
 * manpower/constraints/daily-progress rows raised alongside it (stored as
 * separate tables scoped by project + date, not as relations on the report
 * itself) and its attachments.
 */
export interface ConstructionDailyReportView {
  report: ConstructionDailyReport;
  manpower: ConstructionManpowerEntry[];
  constraints: ConstructionConstraint[];
  dailyProgress: ConstructionDailyProgress[];
  attachments: ConstructionAttachment[];
}

export interface ConstructionTask {
  uid: string;
  project?: ConstructionProject;
  parentTask?: ConstructionTask;
  wbsCode?: string;
  name: string;
  taskMode?: string;
  durationDays?: number;
  startDate?: string;
  finishDate?: string;
  orderIndex?: number;
  notes?: string;
  active?: boolean;
}

export interface ConstructionTaskDtoInput {
  uid?: string;
  projectUid: string;
  parentTaskUid?: string;
  wbsCode?: string;
  name: string;
  taskMode?: string;
  durationDays?: number;
  startDate?: string;
  finishDate?: string;
  orderIndex?: number;
  notes?: string;
}

export interface ConstructionCategoryProgress {
  categoryUid?: string;
  name?: string;
  weight?: number;
  progressPercent?: number;
}

export interface ConstructionDashboard {
  projectUid?: string;
  projectName?: string;
  projectCode?: string;
  status?: ConstructionProjectStatus;
  overallProgressPercent?: number;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  elapsedDays?: number;
  remainingDays?: number;
  expectedProgressPercent?: number;
  scheduleVariancePercent?: number;
  forecastCompletionDate?: string;
  categoryCount?: number;
  activityCount?: number;
  subActivityCount?: number;
  activitiesNotStarted?: number;
  activitiesInProgress?: number;
  activitiesCompleted?: number;
  milestoneCount?: number;
  milestonesPending?: number;
  milestonesInProgress?: number;
  milestonesCompleted?: number;
  milestonesDelayed?: number;
  totalManHours?: number;
  dailyReportCount?: number;
  dailyReportsApproved?: number;
  dailyReportsPending?: number;
  openConstraintCount?: number;
  constraintsCritical?: number;
  constraintsHigh?: number;
  constraintsMedium?: number;
  constraintsLow?: number;
  categories?: ConstructionCategoryProgress[];
}

export type ConstructionGanttBarType = 'CATEGORY' | 'ACTIVITY' | 'SUB_ACTIVITY';

export interface ConstructionGanttBar {
  uid: string;
  name: string;
  type: ConstructionGanttBarType;
  parentUid?: string;
  level: number;
  wbsCode?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  progressPercent?: number;
  weight?: number;
  unitOfMeasure?: string;
  plannedQuantity?: number;
  completedQuantity?: number;
  status?: ConstructionActivityStatus;
  datesDerived?: boolean;
  orderIndex?: number;
  children?: ConstructionGanttBar[];
}

export interface ConstructionGantt {
  projectUid?: string;
  projectName?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectDurationDays?: number;
  projectProgressPercent?: number;
  chartStartDate?: string;
  chartEndDate?: string;
  bars: ConstructionGanttBar[];
}

export interface ConstructionWeightCategoryCheck {
  categoryUid?: string;
  categoryName?: string;
  categoryWeight?: number;
  activityWeightTotal?: number;
  expectedActivityWeightTotal?: number;
  valid?: boolean;
}

export interface ConstructionWeightValidation {
  projectUid?: string;
  valid: boolean;
  activityWeightBasis?: string;
  categoryWeightTotal?: number;
  expectedCategoryWeightTotal?: number;
  messages?: string[];
  categories?: ConstructionWeightCategoryCheck[];
}

// ── Compliance ───────────────────────────────────────────────────────────

export interface ConstructionCompliance {
  uid: string;
  project?: ConstructionProject;
  authorityName: string;
  /** Free text — e.g. "Complied", "Notified", "N/A", "Covered for 365 days". */
  complianceStatus?: string;
  remarks?: string;
  orderIndex?: number;
  active?: boolean;
}

export interface ConstructionComplianceDtoInput {
  uid?: string;
  projectUid: string;
  authorityName: string;
  complianceStatus?: string;
  remarks?: string;
  orderIndex?: number;
}

// ── Procurement ──────────────────────────────────────────────────────────

export interface ConstructionProcurement {
  uid: string;
  project?: ConstructionProject;
  materialName: string;
  supplier?: string;
  /** Free text — e.g. "Delivered", "On shipment progress", "On shelf". */
  deliveryStatus?: string;
  contractSigningPercent?: number;
  orderPlacementPercent?: number;
  fabricationSupplyPercent?: number;
  shipmentPercent?: number;
  deliveryPercent?: number;
  remarks?: string;
  orderIndex?: number;
  active?: boolean;
}

export interface ConstructionProcurementDtoInput {
  uid?: string;
  projectUid: string;
  materialName: string;
  supplier?: string;
  deliveryStatus?: string;
  contractSigningPercent?: number;
  orderPlacementPercent?: number;
  fabricationSupplyPercent?: number;
  shipmentPercent?: number;
  deliveryPercent?: number;
  remarks?: string;
  orderIndex?: number;
}

// ── Monthly report ───────────────────────────────────────────────────────

export interface ConstructionMonthlyChallenge {
  challenge?: string;
  wayForward?: string;
  orderIndex?: number;
}

export interface ConstructionMonthlyChallengeDtoInput {
  challenge?: string;
  wayForward?: string;
  orderIndex?: number;
}

export interface ConstructionMonthlyReport {
  uid: string;
  project?: ConstructionProject;
  projectName?: string;
  reportYear: number;
  reportMonth: number;
  reportNo?: string;
  consultant?: string;
  owner?: string;
  contractAmount?: string;
  background?: string;
  activitiesPerformed?: string;
  hseNarrative?: string;
  procurementNarrative?: string;
  milestonesNarrative?: string;
  plannedNextMonth?: string;
  currentMonthManHours?: number;
  cumulativeManHours?: number;
  overallProgressPercent?: number;
  jsaConducted?: number;
  toolBoxMeetings?: number;
  ptwGeneral?: number;
  hazardousWorkPermit?: number;
  ptwHotWork?: number;
  reportedIncidents?: number;
  reportedAccidents?: number;
  medicalTreatmentCases?: number;
  challenges?: ConstructionMonthlyChallenge[];
  status: DistributionReportStatus;
  preparedByName?: string;
  reviewedByName?: string;
  approvedByName?: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  active?: boolean;
}

export interface ConstructionMonthlyReportDtoInput {
  uid?: string;
  projectUid: string;
  reportYear: number;
  reportMonth: number;
  reportNo?: string;
  consultant?: string;
  owner?: string;
  contractAmount?: string;
  background?: string;
  activitiesPerformed?: string;
  hseNarrative?: string;
  procurementNarrative?: string;
  milestonesNarrative?: string;
  plannedNextMonth?: string;
  jsaConducted?: number;
  toolBoxMeetings?: number;
  ptwGeneral?: number;
  hazardousWorkPermit?: number;
  ptwHotWork?: number;
  reportedIncidents?: number;
  reportedAccidents?: number;
  medicalTreatmentCases?: number;
  challenges?: ConstructionMonthlyChallengeDtoInput[];
  /** Photo/document appendix (generic attachments). */
  attachments?: any[];
}
