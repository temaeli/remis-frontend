import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const hseDrillFields = `
  category
  location
  financialYear
  quarter
  description
  observation
  recommendation
  dateConducted
  status
  submittedAt
  reviewedAt
  endorsedAt
  supervisorComments
  managerComments
  ${baseGqlFields}
`;

export const GET_ALL_HSE_DRILLS = gql`
  query getAllHseDrillsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllHseDrillsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseDrillFields)}
    }
  }
`;

export const GET_HSE_DRILL_BY_UID = gql`
  query getHseDrillByUid($uid: String!){
    getHseDrillByUid(uid: $uid){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const SCHEDULE_OR_UPDATE_HSE_DRILL = gql`
  mutation scheduleOrUpdateHseDrill($input: HseDrillDtoInput!){
    scheduleOrUpdateHseDrill(input: $input){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const SUBMIT_HSE_DRILL_PLAN = gql`
  mutation submitHseDrillPlan($input: HseDrillWorkflowDtoInput!){
    submitHseDrillPlan(input: $input){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const REVIEW_HSE_DRILL_PLAN = gql`
  mutation reviewHseDrillPlan($input: HseDrillWorkflowDtoInput!){
    reviewHseDrillPlan(input: $input){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const ENDORSE_HSE_DRILL_PLAN = gql`
  mutation endorseHseDrillPlan($input: HseDrillWorkflowDtoInput!){
    endorseHseDrillPlan(input: $input){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const REJECT_HSE_DRILL_PLAN = gql`
  mutation rejectHseDrillPlan($input: HseDrillWorkflowDtoInput!){
    rejectHseDrillPlan(input: $input){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const ENTER_HSE_DRILL_DATA = gql`
  mutation enterHseDrillData($input: HseDrillDataDtoInput!){
    enterHseDrillData(input: $input){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const DELETE_HSE_DRILL = gql`
  mutation deleteHseDrill($uid: String!){
    deleteHseDrill(uid: $uid){
      ${responseGqlFields(hseDrillFields)}
    }
  }
`;

export const GENERATE_HSE_DRILL_REPORT = gql`
  query generateHseDrillReport($uid: String!){
    generateHseDrillReport(uid: $uid){
      ${plainResponseGqlFields}
    }
  }
`;

// Attachments
export const drillAttachmentFields = `
  attachmentTitle
  filePath
  mediaType
  mediaSize
  sourceId
  sourceName
  extraIdentifier
  ${baseGqlFields}
`;

export const GET_DRILL_ATTACHMENTS = gql`
  query getDrillAttachments($planUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getDrillAttachments(planUid: $planUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(drillAttachmentFields)}
    }
  }
`;

export const SAVE_OR_UPDATE_DRILL_ATTACHMENT = gql`
  mutation saveOrUpdateDrillAttachment($planUid: String!, $attachmentDto: AttachmentDtoInput!){
    saveOrUpdateDrillAttachment(planUid: $planUid, attachmentDto: $attachmentDto){
      ${responseGqlFields(drillAttachmentFields)}
    }
  }
`;

export const DELETE_DRILL_ATTACHMENT = gql`
  mutation deleteDrillAttachment($attachmentUid: String!){
    deleteDrillAttachment(attachmentUid: $attachmentUid){
      ${responseGqlFields(drillAttachmentFields)}
    }
  }
`;

// Action plans
export const drillActionPlanFields = `
  action
  remarks
  assignedTo
  assignedToAs
  durationInDays
  completedAt
  ${baseGqlFields}
`;

export const GET_DRILL_ACTION_PLANS = gql`
  query getDrillActionPlansPageable($drillUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getDrillActionPlansPageable(drillUid: $drillUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(drillActionPlanFields)}
    }
  }
`;

export const GET_DRILL_ACTION_PLAN_BY_UID = gql`
  query getDrillActionPlanByUid($uid: String!){
    getDrillActionPlanByUid(uid: $uid){
      ${responseGqlFields(drillActionPlanFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_DRILL_ACTION_PLAN = gql`
  mutation createOrUpdateDrillActionPlan($input: ActionPlanDtoInput!, $drillPlanUid: String!){
    createOrUpdateDrillActionPlan(input: $input, drillPlanUid: $drillPlanUid){
      ${responseGqlFields(drillActionPlanFields)}
    }
  }
`;

export const DELETE_DRILL_ACTION_PLAN = gql`
  mutation deleteDrillActionPlan($uid: String!, $drillUid: String!){
    deleteDrillActionPlan(uid: $uid, drillUid: $drillUid){
      ${responseGqlFields(drillActionPlanFields)}
    }
  }
`;

export const MARK_DRILL_CORRECTIVE_ACTION_COMPLETED = gql`
  mutation markDrillCorrectiveActionCompleted($uid: String!, $comment: String!){
    markDrillCorrectiveActionCompleted(uid: $uid, comment: $comment){
      ${responseGqlFields(drillActionPlanFields)}
    }
  }
`;
