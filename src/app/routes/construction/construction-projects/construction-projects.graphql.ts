import { gql } from '@apollo/client/core';
import { baseGqlFields, pageGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { subwardFields } from '@routes/settings/regions/subward/subward.graphql';

// ── GQL field sets ──────────────────────────────────────────────────────────

export const contractorGqlFields = `
code
name
registrationNumber
tin
contactPerson
phone
email
address
description
${baseGqlFields}
`;

export const constructionProjectGqlFields = `
code
name
contractNumber
clientName
owner
consultant
contractAmount
contractor{
 id
 uid
 name
}
subWard{${subwardFields}}
physicalAddress
startDate
endDate
durationDays
description
requireActivityDates
status
progressPercent
${baseGqlFields}
`;

export const constructionCategoryGqlFields = `
project{
 id
 uid
 name
}
name
description
startDate
endDate
weight
orderIndex
progressPercent
${baseGqlFields}
`;

export const constructionActivityGqlFields = `
category{
 id
 uid
 name
 project{
  id
  uid
  name
 }
}
parentActivity{
 id
 uid
 name
}
name
description
unitOfMeasure
startDate
endDate
plannedQuantity
completedQuantity
weight
status
orderIndex
progressPercent
${baseGqlFields}
`;

export const constructionMilestoneGqlFields = `
project{
 id
 uid
 name
}
activity{
 id
 uid
 name
}
name
description
targetDate
status
orderIndex
progressPercent
${baseGqlFields}
`;

export const constructionDailyProgressGqlFields = `
activity{
 id
 uid
 name
}
project{
 id
 uid
 name
}
reportDate
cumulativeQuantity
previousCumulativeQuantity
dailyQuantity
note
${baseGqlFields}
`;

/** Read-only attachment shape returned by the construction `*Attachments` queries. */
export const constructionAttachmentGqlFields = `
uid
attachmentTitle
filePath
mediaSize
mediaType
model
sourceId
sourceName
`;

export const constructionConstraintGqlFields = `
project{
 id
 uid
 name
}
title
constraintType
description
impactLevel
responsiblePerson
mitigationAction
status
raisedDate
targetResolutionDate
resolvedDate
${baseGqlFields}
`;

export const constructionDailyReportGqlFields = `
project{
 id
 uid
 name
}
projectName
reportDate
weather
workforceCount
workforceNotes
visitors
workPerformed
quantitiesCompleted
hseObservations
qualityControl
challenges
correctiveActions
planForNextDay
subContractor
financier
toolBoxMeeting
staffAtSite
projectProgressPercent
status
preparedByName
checkedByName
approvedByName
submittedAt
reviewedAt
approvedAt
${baseGqlFields}
`;

export const constructionManpowerEntryGqlFields = `
project{
 id
 uid
 name
}
entryDate
workforceCategory
personnelCount
hoursPerDay
manHours
note
${baseGqlFields}
`;

export const constructionManHourSummaryGqlFields = `
projectUid
fromDate
toDate
totalManHours
totalPersonnelDays
byCategory{
 workforceCategory
 personnelDays
 manHours
}
`;

export const constructionTaskGqlFields = `
project{
 id
 uid
 name
}
parentTask{
 id
 uid
 name
}
wbsCode
name
taskMode
durationDays
startDate
finishDate
orderIndex
notes
${baseGqlFields}
`;

export const constructionDashboardGqlFields = `
projectUid
projectName
projectCode
status
overallProgressPercent
startDate
endDate
durationDays
elapsedDays
remainingDays
expectedProgressPercent
scheduleVariancePercent
forecastCompletionDate
categoryCount
activityCount
subActivityCount
activitiesNotStarted
activitiesInProgress
activitiesCompleted
milestoneCount
milestonesPending
milestonesInProgress
milestonesCompleted
milestonesDelayed
totalManHours
dailyReportCount
dailyReportsApproved
dailyReportsPending
openConstraintCount
constraintsCritical
constraintsHigh
constraintsMedium
constraintsLow
categories{
 categoryUid
 name
 weight
 progressPercent
}
`;

export const constructionWeightValidationGqlFields = `
projectUid
valid
activityWeightBasis
categoryWeightTotal
expectedCategoryWeightTotal
messages
categories{
 categoryUid
 categoryName
 categoryWeight
 activityWeightTotal
 expectedActivityWeightTotal
 valid
}
`;

// ── Project ──────────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_PROJECT = gql`
  mutation saveConstructionProject($dto: ConstructionProjectDtoInput) {
    saveConstructionProject(dto: $dto) {
      ${responseGqlFields(constructionProjectGqlFields)}
    }
  }
`;

export const ALL_CONSTRUCTION_PROJECTS = gql`
  query allConstructionProjects {
    allConstructionProjects {
      ${constructionProjectGqlFields}
    }
  }
`;

export const ALL_CONTRACTORS = gql`
  query allContractors {
    allContractors {
      ${contractorGqlFields}
    }
  }
`;

export const FIND_CONTRACTOR = gql`
  query findContractor($uid: String) {
    findContractor(uid: $uid) {
      ${responseGqlFields(contractorGqlFields)}
    }
  }
`;

export const SAVE_CONTRACTOR = gql`
  mutation saveContractor($dto: ContractorDtoInput) {
    saveContractor(dto: $dto) {
      ${responseGqlFields(contractorGqlFields)}
    }
  }
`;

export const DELETE_CONTRACTOR = gql`
  mutation deleteContractor($uid: String) {
    deleteContractor(uid: $uid) {
      ${responseGqlFields(contractorGqlFields)}
    }
  }
`;

export const ALL_CONSTRUCTION_PROJECTS_PAGEABLE = gql`
  query allConstructionProjectsPageable($active: Boolean, $pageableParam: PageableParamInput) {
    allConstructionProjectsPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(constructionProjectGqlFields)}
    }
  }
`;

export const FIND_CONSTRUCTION_PROJECT = gql`
  query findConstructionProject($uid: String) {
    findConstructionProject(uid: $uid) {
      ${responseGqlFields(constructionProjectGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_PROJECT = gql`
  mutation deleteConstructionProject($uid: String) {
    deleteConstructionProject(uid: $uid) {
      ${responseGqlFields(constructionProjectGqlFields)}
    }
  }
`;

export const VALIDATE_CONSTRUCTION_PROJECT_WEIGHTS = gql`
  query validateConstructionProjectWeights($projectUid: String) {
    validateConstructionProjectWeights(projectUid: $projectUid) {
      ${constructionWeightValidationGqlFields}
    }
  }
`;

export const RECOMPUTE_CONSTRUCTION_PROJECT_PROGRESS = gql`
  mutation recomputeConstructionProjectProgress($projectUid: String) {
    recomputeConstructionProjectProgress(projectUid: $projectUid) {
      ${responseGqlFields(constructionProjectGqlFields)}
    }
  }
`;

// ── Category ─────────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_CATEGORY = gql`
  mutation saveConstructionCategory($dto: ConstructionCategoryDtoInput) {
    saveConstructionCategory(dto: $dto) {
      ${responseGqlFields(constructionCategoryGqlFields)}
    }
  }
`;

export const CONSTRUCTION_CATEGORIES = gql`
  query constructionCategories($projectUid: String) {
    constructionCategories(projectUid: $projectUid) {
      ${constructionCategoryGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_CATEGORIES = gql`
  query allConstructionCategories($projectUid: String) {
    allConstructionCategories(projectUid: $projectUid) {
      ${constructionCategoryGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_CATEGORY = gql`
  query findConstructionCategory($uid: String) {
    findConstructionCategory(uid: $uid) {
      ${responseGqlFields(constructionCategoryGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_CATEGORY = gql`
  mutation deleteConstructionCategory($uid: String) {
    deleteConstructionCategory(uid: $uid) {
      ${responseGqlFields(constructionCategoryGqlFields)}
    }
  }
`;

// ── Activity ─────────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_ACTIVITY = gql`
  mutation saveConstructionActivity($dto: ConstructionActivityDtoInput) {
    saveConstructionActivity(dto: $dto) {
      ${responseGqlFields(constructionActivityGqlFields)}
    }
  }
`;

export const CONSTRUCTION_ACTIVITIES = gql`
  query constructionActivities($categoryUid: String) {
    constructionActivities(categoryUid: $categoryUid) {
      ${constructionActivityGqlFields}
    }
  }
`;

export const CONSTRUCTION_ACTIVITIES_FOR_PROJECT = gql`
  query constructionActivitiesForProject($projectUid: String) {
    constructionActivitiesForProject(projectUid: $projectUid) {
      ${constructionActivityGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_ACTIVITIES = gql`
  query allConstructionActivities($projectUid: String) {
    allConstructionActivities(projectUid: $projectUid) {
      ${constructionActivityGqlFields}
    }
  }
`;

export const CONSTRUCTION_SUB_ACTIVITIES = gql`
  query constructionSubActivities($parentActivityUid: String) {
    constructionSubActivities(parentActivityUid: $parentActivityUid) {
      ${constructionActivityGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_ACTIVITY = gql`
  query findConstructionActivity($uid: String) {
    findConstructionActivity(uid: $uid) {
      ${responseGqlFields(constructionActivityGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_ACTIVITY = gql`
  mutation deleteConstructionActivity($uid: String) {
    deleteConstructionActivity(uid: $uid) {
      ${responseGqlFields(constructionActivityGqlFields)}
    }
  }
`;

// ── Milestone ────────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_MILESTONE = gql`
  mutation saveConstructionMilestone($dto: ConstructionMilestoneDtoInput) {
    saveConstructionMilestone(dto: $dto) {
      ${responseGqlFields(constructionMilestoneGqlFields)}
    }
  }
`;

export const CONSTRUCTION_MILESTONES = gql`
  query constructionMilestones($projectUid: String) {
    constructionMilestones(projectUid: $projectUid) {
      ${constructionMilestoneGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_MILESTONES = gql`
  query allConstructionMilestones($projectUid: String) {
    allConstructionMilestones(projectUid: $projectUid) {
      ${constructionMilestoneGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_MILESTONE = gql`
  query findConstructionMilestone($uid: String) {
    findConstructionMilestone(uid: $uid) {
      ${responseGqlFields(constructionMilestoneGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_MILESTONE = gql`
  mutation deleteConstructionMilestone($uid: String) {
    deleteConstructionMilestone(uid: $uid) {
      ${responseGqlFields(constructionMilestoneGqlFields)}
    }
  }
`;

// ── Daily progress ───────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_DAILY_PROGRESS = gql`
  mutation saveConstructionDailyProgress($dto: ConstructionDailyProgressDtoInput) {
    saveConstructionDailyProgress(dto: $dto) {
      ${responseGqlFields(constructionDailyProgressGqlFields)}
    }
  }
`;

export const CONSTRUCTION_DAILY_PROGRESS_FOR_DATE = gql`
  query constructionDailyProgressForDate($projectUid: String, $reportDate: LocalDate) {
    constructionDailyProgressForDate(projectUid: $projectUid, reportDate: $reportDate) {
      ${constructionDailyProgressGqlFields}
    }
  }
`;

export const CONSTRUCTION_DAILY_PROGRESS_FOR_ACTIVITY = gql`
  query constructionDailyProgressForActivity($activityUid: String) {
    constructionDailyProgressForActivity(activityUid: $activityUid) {
      ${constructionDailyProgressGqlFields}
    }
  }
`;

export const CONSTRUCTION_DAILY_PROGRESS_FOR_PROJECT = gql`
  query constructionDailyProgressForProject($projectUid: String) {
    constructionDailyProgressForProject(projectUid: $projectUid) {
      ${constructionDailyProgressGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_DAILY_PROGRESS = gql`
  query allConstructionDailyProgress($projectUid: String) {
    allConstructionDailyProgress(projectUid: $projectUid) {
      ${constructionDailyProgressGqlFields}
    }
  }
`;

export const DELETE_CONSTRUCTION_DAILY_PROGRESS = gql`
  mutation deleteConstructionDailyProgress($uid: String) {
    deleteConstructionDailyProgress(uid: $uid) {
      ${responseGqlFields(constructionDailyProgressGqlFields)}
    }
  }
`;

// ── Daily report ─────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_DAILY_REPORT = gql`
  mutation saveConstructionDailyReport($dto: ConstructionDailyReportDtoInput) {
    saveConstructionDailyReport(dto: $dto) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const CONSTRUCTION_DAILY_REPORTS = gql`
  query constructionDailyReports($projectUid: String) {
    constructionDailyReports(projectUid: $projectUid) {
      ${constructionDailyReportGqlFields}
    }
  }
`;

export const CONSTRUCTION_DAILY_REPORT_ATTACHMENTS = gql`
  query constructionDailyReportAttachments($reportUid: String) {
    constructionDailyReportAttachments(reportUid: $reportUid) {
      ${constructionAttachmentGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_DAILY_REPORTS_PAGEABLE = gql`
  query allConstructionDailyReportsPageable($active: Boolean, $pageableParam: PageableParamInput) {
    allConstructionDailyReportsPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const FIND_CONSTRUCTION_DAILY_REPORT = gql`
  query findConstructionDailyReport($uid: String) {
    findConstructionDailyReport(uid: $uid) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const SUBMIT_CONSTRUCTION_DAILY_REPORT = gql`
  mutation submitConstructionDailyReport($action: WorkflowActionDtoInput) {
    submitConstructionDailyReport(action: $action) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const REVIEW_CONSTRUCTION_DAILY_REPORT = gql`
  mutation reviewConstructionDailyReport($action: WorkflowActionDtoInput) {
    reviewConstructionDailyReport(action: $action) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const APPROVE_CONSTRUCTION_DAILY_REPORT = gql`
  mutation approveConstructionDailyReport($action: WorkflowActionDtoInput) {
    approveConstructionDailyReport(action: $action) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const REJECT_CONSTRUCTION_DAILY_REPORT = gql`
  mutation rejectConstructionDailyReport($action: WorkflowActionDtoInput) {
    rejectConstructionDailyReport(action: $action) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_DAILY_REPORT = gql`
  mutation deleteConstructionDailyReport($uid: String) {
    deleteConstructionDailyReport(uid: $uid) {
      ${responseGqlFields(constructionDailyReportGqlFields)}
    }
  }
`;

export const CONSTRUCTION_DAILY_REPORT_PDF = gql`
  query constructionDailyReportPdf($uid: String) {
    constructionDailyReportPdf(uid: $uid) {
      status
      message
      data
    }
  }
`;

export const CONSTRUCTION_DAILY_REPORT_XLSX = gql`
  query constructionDailyReportXlsx($uid: String) {
    constructionDailyReportXlsx(uid: $uid) {
      status
      message
      data
    }
  }
`;

export const CONSTRUCTION_DAILY_REPORT_DOCX = gql`
  query constructionDailyReportDocx($uid: String) {
    constructionDailyReportDocx(uid: $uid) {
      status
      message
      data
    }
  }
`;

/**
 * Aggregate view of a report + its manpower/constraints/daily-progress rows
 * (stored as separate tables, not relations on the report) + attachments.
 */
export const constructionDailyReportViewGqlFields = `
report{${constructionDailyReportGqlFields}}
manpower{${constructionManpowerEntryGqlFields}}
constraints{${constructionConstraintGqlFields}}
dailyProgress{${constructionDailyProgressGqlFields}}
attachments{${constructionAttachmentGqlFields}}
`;

export const CONSTRUCTION_DAILY_REPORT_VIEW = gql`
  query constructionDailyReportView($uid: String) {
    constructionDailyReportView(uid: $uid) {
      ${responseGqlFields(constructionDailyReportViewGqlFields)}
    }
  }
`;

// ── Manpower ─────────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_MANPOWER_ENTRY = gql`
  mutation saveConstructionManpowerEntry($dto: ConstructionManpowerEntryDtoInput) {
    saveConstructionManpowerEntry(dto: $dto) {
      ${responseGqlFields(constructionManpowerEntryGqlFields)}
    }
  }
`;

export const CONSTRUCTION_MANPOWER_ENTRIES = gql`
  query constructionManpowerEntries($projectUid: String) {
    constructionManpowerEntries(projectUid: $projectUid) {
      ${constructionManpowerEntryGqlFields}
    }
  }
`;

export const CONSTRUCTION_MANPOWER_FOR_DATE = gql`
  query constructionManpowerForDate($projectUid: String, $entryDate: LocalDate) {
    constructionManpowerForDate(projectUid: $projectUid, entryDate: $entryDate) {
      ${constructionManpowerEntryGqlFields}
    }
  }
`;

export const CONSTRUCTION_MAN_HOUR_SUMMARY = gql`
  query constructionManHourSummary($projectUid: String, $fromDate: LocalDate, $toDate: LocalDate) {
    constructionManHourSummary(projectUid: $projectUid, fromDate: $fromDate, toDate: $toDate) {
      ${constructionManHourSummaryGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_MANPOWER_ENTRIES = gql`
  query allConstructionManpowerEntries($projectUid: String) {
    allConstructionManpowerEntries(projectUid: $projectUid) {
      ${constructionManpowerEntryGqlFields}
    }
  }
`;

export const DELETE_CONSTRUCTION_MANPOWER_ENTRY = gql`
  mutation deleteConstructionManpowerEntry($uid: String) {
    deleteConstructionManpowerEntry(uid: $uid) {
      ${responseGqlFields(constructionManpowerEntryGqlFields)}
    }
  }
`;

// ── Constraint ───────────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_CONSTRAINT = gql`
  mutation saveConstructionConstraint($dto: ConstructionConstraintDtoInput) {
    saveConstructionConstraint(dto: $dto) {
      ${responseGqlFields(constructionConstraintGqlFields)}
    }
  }
`;

export const CONSTRUCTION_CONSTRAINTS = gql`
  query constructionConstraints($projectUid: String) {
    constructionConstraints(projectUid: $projectUid) {
      ${constructionConstraintGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_CONSTRAINT = gql`
  query findConstructionConstraint($uid: String) {
    findConstructionConstraint(uid: $uid) {
      ${responseGqlFields(constructionConstraintGqlFields)}
    }
  }
`;

export const ALL_CONSTRUCTION_CONSTRAINTS = gql`
  query allConstructionConstraints($projectUid: String) {
    allConstructionConstraints(projectUid: $projectUid) {
      ${constructionConstraintGqlFields}
    }
  }
`;

export const DELETE_CONSTRUCTION_CONSTRAINT = gql`
  mutation deleteConstructionConstraint($uid: String) {
    deleteConstructionConstraint(uid: $uid) {
      ${responseGqlFields(constructionConstraintGqlFields)}
    }
  }
`;

// ── Task / schedule ──────────────────────────────────────────────────────

export const SAVE_CONSTRUCTION_TASK = gql`
  mutation saveConstructionTask($dto: ConstructionTaskDtoInput) {
    saveConstructionTask(dto: $dto) {
      ${responseGqlFields(constructionTaskGqlFields)}
    }
  }
`;

export const CONSTRUCTION_TASKS = gql`
  query constructionTasks($projectUid: String) {
    constructionTasks(projectUid: $projectUid) {
      ${constructionTaskGqlFields}
    }
  }
`;

export const CONSTRUCTION_SUB_TASKS = gql`
  query constructionSubTasks($parentTaskUid: String) {
    constructionSubTasks(parentTaskUid: $parentTaskUid) {
      ${constructionTaskGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_TASK = gql`
  query findConstructionTask($uid: String) {
    findConstructionTask(uid: $uid) {
      ${responseGqlFields(constructionTaskGqlFields)}
    }
  }
`;

export const ALL_CONSTRUCTION_TASKS = gql`
  query allConstructionTasks($projectUid: String) {
    allConstructionTasks(projectUid: $projectUid) {
      ${constructionTaskGqlFields}
    }
  }
`;

export const DELETE_CONSTRUCTION_TASK = gql`
  mutation deleteConstructionTask($uid: String) {
    deleteConstructionTask(uid: $uid) {
      ${responseGqlFields(constructionTaskGqlFields)}
    }
  }
`;

// ── Dashboard ────────────────────────────────────────────────────────────

export const CONSTRUCTION_PROJECT_DASHBOARD = gql`
  query constructionProjectDashboard($projectUid: String) {
    constructionProjectDashboard(projectUid: $projectUid) {
      ${constructionDashboardGqlFields}
    }
  }
`;

// ── Gantt Chart ──────────────────────────────────────────────────────────

export const constructionGanttBarGqlFields = `
uid
name
type
parentUid
level
wbsCode
startDate
endDate
durationDays
progressPercent
weight
unitOfMeasure
plannedQuantity
completedQuantity
status
datesDerived
orderIndex
`;

export const constructionGanttGqlFields = `
projectUid
projectName
projectStartDate
projectEndDate
projectDurationDays
projectProgressPercent
chartStartDate
chartEndDate
bars{
  ${constructionGanttBarGqlFields}
  children{
    ${constructionGanttBarGqlFields}
    children{
      ${constructionGanttBarGqlFields}
    }
  }
}
`;

export const CONSTRUCTION_GANTT_CHART = gql`
  query constructionGanttChart($projectUid: String) {
    constructionGanttChart(projectUid: $projectUid) {
      ${constructionGanttGqlFields}
    }
  }
`;

// ── Compliance ───────────────────────────────────────────────────────────

export const constructionComplianceGqlFields = `
project{
 id
 uid
 name
}
authorityName
complianceStatus
remarks
orderIndex
${baseGqlFields}
`;

export const SAVE_CONSTRUCTION_COMPLIANCE = gql`
  mutation saveConstructionCompliance($dto: ConstructionComplianceDtoInput) {
    saveConstructionCompliance(dto: $dto) {
      ${responseGqlFields(constructionComplianceGqlFields)}
    }
  }
`;

export const CONSTRUCTION_COMPLIANCES = gql`
  query constructionCompliances($projectUid: String) {
    constructionCompliances(projectUid: $projectUid) {
      ${constructionComplianceGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_COMPLIANCE = gql`
  query findConstructionCompliance($uid: String) {
    findConstructionCompliance(uid: $uid) {
      ${responseGqlFields(constructionComplianceGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_COMPLIANCE = gql`
  mutation deleteConstructionCompliance($uid: String) {
    deleteConstructionCompliance(uid: $uid) {
      ${responseGqlFields(constructionComplianceGqlFields)}
    }
  }
`;

// ── Procurement ──────────────────────────────────────────────────────────

export const constructionProcurementGqlFields = `
project{
 id
 uid
 name
}
materialName
supplier
deliveryStatus
contractSigningPercent
orderPlacementPercent
fabricationSupplyPercent
shipmentPercent
deliveryPercent
remarks
orderIndex
${baseGqlFields}
`;

export const SAVE_CONSTRUCTION_PROCUREMENT = gql`
  mutation saveConstructionProcurement($dto: ConstructionProcurementDtoInput) {
    saveConstructionProcurement(dto: $dto) {
      ${responseGqlFields(constructionProcurementGqlFields)}
    }
  }
`;

export const CONSTRUCTION_PROCUREMENTS = gql`
  query constructionProcurements($projectUid: String) {
    constructionProcurements(projectUid: $projectUid) {
      ${constructionProcurementGqlFields}
    }
  }
`;

export const FIND_CONSTRUCTION_PROCUREMENT = gql`
  query findConstructionProcurement($uid: String) {
    findConstructionProcurement(uid: $uid) {
      ${responseGqlFields(constructionProcurementGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_PROCUREMENT = gql`
  mutation deleteConstructionProcurement($uid: String) {
    deleteConstructionProcurement(uid: $uid) {
      ${responseGqlFields(constructionProcurementGqlFields)}
    }
  }
`;

// ── Monthly report ───────────────────────────────────────────────────────

export const constructionMonthlyChallengeGqlFields = `
challenge
wayForward
orderIndex
`;

export const constructionMonthlyReportGqlFields = `
project{
 id
 uid
 name
}
projectName
reportYear
reportMonth
reportNo
consultant
owner
contractAmount
background
activitiesPerformed
hseNarrative
procurementNarrative
milestonesNarrative
plannedNextMonth
currentMonthManHours
cumulativeManHours
overallProgressPercent
jsaConducted
toolBoxMeetings
ptwGeneral
hazardousWorkPermit
ptwHotWork
reportedIncidents
reportedAccidents
medicalTreatmentCases
challenges{${constructionMonthlyChallengeGqlFields}}
status
preparedByName
reviewedByName
approvedByName
submittedAt
reviewedAt
approvedAt
${baseGqlFields}
`;

export const SAVE_CONSTRUCTION_MONTHLY_REPORT = gql`
  mutation saveConstructionMonthlyReport($dto: ConstructionMonthlyReportDtoInput) {
    saveConstructionMonthlyReport(dto: $dto) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const CONSTRUCTION_MONTHLY_REPORTS = gql`
  query constructionMonthlyReports($projectUid: String) {
    constructionMonthlyReports(projectUid: $projectUid) {
      ${constructionMonthlyReportGqlFields}
    }
  }
`;

export const ALL_CONSTRUCTION_MONTHLY_REPORTS_PAGEABLE = gql`
  query allConstructionMonthlyReportsPageable($active: Boolean, $pageableParam: PageableParamInput) {
    allConstructionMonthlyReportsPageable(active: $active, pageableParam: $pageableParam) {
      ${pageGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const FIND_CONSTRUCTION_MONTHLY_REPORT = gql`
  query findConstructionMonthlyReport($uid: String) {
    findConstructionMonthlyReport(uid: $uid) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const CONSTRUCTION_MONTHLY_REPORT_ATTACHMENTS = gql`
  query constructionMonthlyReportAttachments($reportUid: String) {
    constructionMonthlyReportAttachments(reportUid: $reportUid) {
      ${constructionAttachmentGqlFields}
    }
  }
`;

export const SUBMIT_CONSTRUCTION_MONTHLY_REPORT = gql`
  mutation submitConstructionMonthlyReport($action: WorkflowActionDtoInput) {
    submitConstructionMonthlyReport(action: $action) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const REVIEW_CONSTRUCTION_MONTHLY_REPORT = gql`
  mutation reviewConstructionMonthlyReport($action: WorkflowActionDtoInput) {
    reviewConstructionMonthlyReport(action: $action) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const APPROVE_CONSTRUCTION_MONTHLY_REPORT = gql`
  mutation approveConstructionMonthlyReport($action: WorkflowActionDtoInput) {
    approveConstructionMonthlyReport(action: $action) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const REJECT_CONSTRUCTION_MONTHLY_REPORT = gql`
  mutation rejectConstructionMonthlyReport($action: WorkflowActionDtoInput) {
    rejectConstructionMonthlyReport(action: $action) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const DELETE_CONSTRUCTION_MONTHLY_REPORT = gql`
  mutation deleteConstructionMonthlyReport($uid: String) {
    deleteConstructionMonthlyReport(uid: $uid) {
      ${responseGqlFields(constructionMonthlyReportGqlFields)}
    }
  }
`;

export const CONSTRUCTION_MONTHLY_REPORT_PDF = gql`
  query constructionMonthlyReportPdf($uid: String) {
    constructionMonthlyReportPdf(uid: $uid) {
      status
      message
      data
    }
  }
`;

export const CONSTRUCTION_MONTHLY_REPORT_DOCX = gql`
  query constructionMonthlyReportDocx($uid: String) {
    constructionMonthlyReportDocx(uid: $uid) {
      status
      message
      data
    }
  }
`;

// POST /graphql - saveConstructionProject
// POST /graphql - allConstructionProjects
// POST /graphql - allConstructionProjectsPageable
// POST /graphql - findConstructionProject
// POST /graphql - deleteConstructionProject
// POST /graphql - validateConstructionProjectWeights
// POST /graphql - recomputeConstructionProjectProgress
// POST /graphql - saveConstructionCategory
// POST /graphql - constructionCategories
// POST /graphql - findConstructionCategory
// POST /graphql - deleteConstructionCategory
// POST /graphql - saveConstructionActivity
// POST /graphql - constructionActivities
// POST /graphql - constructionActivitiesForProject
// POST /graphql - constructionSubActivities
// POST /graphql - findConstructionActivity
// POST /graphql - deleteConstructionActivity
// POST /graphql - saveConstructionMilestone
// POST /graphql - constructionMilestones
// POST /graphql - findConstructionMilestone
// POST /graphql - deleteConstructionMilestone
// POST /graphql - saveConstructionDailyProgress
// POST /graphql - constructionDailyProgressForDate
// POST /graphql - constructionDailyProgressForActivity
// POST /graphql - constructionDailyProgressForProject
// POST /graphql - deleteConstructionDailyProgress
// POST /graphql - saveConstructionDailyReport
// POST /graphql - constructionDailyReports
// POST /graphql - allConstructionDailyReportsPageable
// POST /graphql - findConstructionDailyReport
// POST /graphql - submitConstructionDailyReport
// POST /graphql - reviewConstructionDailyReport
// POST /graphql - approveConstructionDailyReport
// POST /graphql - rejectConstructionDailyReport
// POST /graphql - deleteConstructionDailyReport
// POST /graphql - constructionDailyReportPdf
// POST /graphql - constructionDailyReportXlsx
// POST /graphql - saveConstructionManpowerEntry
// POST /graphql - constructionManpowerEntries
// POST /graphql - constructionManpowerForDate
// POST /graphql - constructionManHourSummary
// POST /graphql - deleteConstructionManpowerEntry
// POST /graphql - saveConstructionConstraint
// POST /graphql - constructionConstraints
// POST /graphql - findConstructionConstraint
// POST /graphql - deleteConstructionConstraint
// POST /graphql - saveConstructionTask
// POST /graphql - constructionTasks
// POST /graphql - constructionSubTasks
// POST /graphql - findConstructionTask
// POST /graphql - deleteConstructionTask
// POST /graphql - constructionProjectDashboard
// POST /graphql - allConstructionCategories
// POST /graphql - allConstructionActivities
// POST /graphql - allConstructionMilestones
// POST /graphql - allConstructionDailyProgress
// POST /graphql - allConstructionManpowerEntries
// POST /graphql - allConstructionConstraints
// POST /graphql - allConstructionTasks
// POST /graphql - constructionDailyReportDocx
// POST /graphql - saveConstructionCompliance
// POST /graphql - constructionCompliances
// POST /graphql - findConstructionCompliance
// POST /graphql - deleteConstructionCompliance
// POST /graphql - saveConstructionProcurement
// POST /graphql - constructionProcurements
// POST /graphql - findConstructionProcurement
// POST /graphql - deleteConstructionProcurement
// POST /graphql - saveConstructionMonthlyReport
// POST /graphql - constructionMonthlyReports
// POST /graphql - allConstructionMonthlyReportsPageable
// POST /graphql - findConstructionMonthlyReport
// POST /graphql - constructionMonthlyReportAttachments
// POST /graphql - submitConstructionMonthlyReport
// POST /graphql - reviewConstructionMonthlyReport
// POST /graphql - approveConstructionMonthlyReport
// POST /graphql - rejectConstructionMonthlyReport
// POST /graphql - deleteConstructionMonthlyReport
// POST /graphql - constructionMonthlyReportPdf
// POST /graphql - constructionMonthlyReportDocx
