import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const incidentAffectedPersonnelFields = `
  affectationType
  description
  name
  ${baseGqlFields}
`;

export const incidentFields = `
  immediateCause
  rootCause
  detailedDescription
  location
  reportedBy
  timeHappened
  incidentType {
    uid
    name
  }
  workStation {
    uid
    name
  }
  immediateActionTaken
  proposedActionToPreventReoccurrence
  status
  currentActor {
    uid
    actor
    status
    actedAt
    comments
    notes
    actedBy {
      uid
      username
      firstName
      lastName
    }
  }
  rejectedAt
  rejectedBy {
    uid
    username
    firstName
    lastName
  }
  reviewedAt
  comment
  hseo {
    uid
    firstName
    lastName
  }
  affectedPersonnel {
    uid
    affectationType
    description
    name
  }
  createdBy {
    uid
    username
  }
  ${baseGqlFields}
`;

export const incidentAffectedAssetFields = `
  affectationType
  name
  specification
  description
  ${baseGqlFields}
`;

export const incidentAttachmentFields = `
  attachmentTitle
  filePath
  mediaType
  mediaSize
  sourceId
  sourceName
  extraIdentifier
  ${baseGqlFields}
`;

export const GET_ALL_INCIDENTS = gql`
  query getAllIncidentsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllIncidentsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(incidentFields)}
    }
  }
`;

// Scoped to the current user's current workstation (BE uses
// SecurityService.isInternalStaff() + resolves station from
// UserWorkstation.current). Same fields as GET_ALL_INCIDENTS.
export const GET_MY_WORKSTATION_INCIDENTS = gql`
  query getMyWorkstationIncidents($active: Boolean, $pageableParam: PageableParamInput){
    getMyWorkstationIncidents(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(incidentFields)}
    }
  }
`;

export const GET_INCIDENTS_BY_STATION = gql`
  query getIncidentsByStation($stationUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getIncidentsByStation(stationUid: $stationUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(incidentFields)}
    }
  }
`;

export const GET_INCIDENT_BY_UID = gql`
  query getIncidentByUid($uid: String!){
    getIncidentByUid(uid: $uid){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

export const REPORT_INCIDENT = gql`
  mutation reportIncident($input: IncidentDtoInput!){
    reportIncident(input: $input){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

export const UPDATE_INCIDENT = gql`
  mutation updateIncident($input: IncidentDtoInput!){
    updateIncident(input: $input){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

export const DELETE_INCIDENT = gql`
  mutation deleteIncident($uid: String!){
    deleteIncident(uid: $uid){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

// Affected Personnel Operations
export const GET_INCIDENT_AFFECTED_PEOPLE_BY_INCIDENT_UID = gql`
  query getIncidentAffectedPeopleByIncidentUid($incidentUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getIncidentAffectedPeopleByIncidentUid(incidentUid: $incidentUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(incidentAffectedPersonnelFields)}
    }
  }
`;

export const GET_INCIDENT_AFFECTED_PERSONNEL_BY_UID = gql`
  query getIncidentAffectedPersonnelByUid($personnelUid: String!){
    getIncidentAffectedPersonnelByUid(personnelUid: $personnelUid){
      ${responseGqlFields(incidentAffectedPersonnelFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INCIDENT_AFFECTED_PERSONNEL = gql`
  mutation createOrUpdateIncidentAffectedPersonnel($input: IncidentAffectedPersonnelDtoInput!){
    createOrUpdateIncidentAffectedPersonnel(input: $input){
      ${responseGqlFields(incidentAffectedPersonnelFields)}
    }
  }
`;

export const DELETE_INCIDENT_AFFECTED_PERSONNEL = gql`
  mutation deleteIncidentAffectedPersonnel($uid: String!){
    deleteIncidentAffectedPersonnel(uid: $uid){
      ${responseGqlFields(incidentAffectedPersonnelFields)}
    }
  }
`;

// Affected Asset Operations
export const GET_INCIDENT_AFFECTED_ASSETS_BY_INCIDENT = gql`
  query getIncidentAffectedAssetsByIncident($incidentUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getIncidentAffectedAssetsByIncident(incidentUid: $incidentUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(incidentAffectedAssetFields)}
    }
  }
`;

export const GET_INCIDENT_AFFECTED_ASSET_BY_UID = gql`
  query getIncidentAffectedAssetByUid($uid: String!){
    getIncidentAffectedAssetByUid(uid: $uid){
      ${responseGqlFields(incidentAffectedAssetFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INCIDENT_AFFECTED_ASSET = gql`
  mutation createOrUpdateIncidentAffectedAsset($input: IncidentAffectedAssetDtoInput!){
    createOrUpdateIncidentAffectedAsset(input: $input){
      ${responseGqlFields(incidentAffectedAssetFields)}
    }
  }
`;

export const DELETE_INCIDENT_AFFECTED_ASSET = gql`
  mutation deleteIncidentAffectedAsset($uid: String!){
    deleteIncidentAffectedAsset(uid: $uid){
      ${responseGqlFields(incidentAffectedAssetFields)}
    }
  }
`;

// Workflow
export const SUBMIT_REPORTED_INCIDENT = gql`
  mutation submitReportedIncident($incidentUid: String!){
    submitReportedIncident(incidentUid: $incidentUid){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

export const APPROVE_REPORTED_INCIDENT = gql`
  mutation approveReportedIncident($incidentUid: String!, $comment: String!){
    approveReportedIncident(incidentUid: $incidentUid, comment: $comment){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

export const REJECT_REPORTED_INCIDENT = gql`
  mutation rejectReportedIncident($incidentUid: String!, $comment: String!){
    rejectReportedIncident(incidentUid: $incidentUid, comment: $comment){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

export const MARK_INCIDENT_AS_REVIEWED = gql`
  mutation markIncidentAsReviewed($incidentUid: String!){
    markIncidentAsReviewed(incidentUid: $incidentUid){
      ${responseGqlFields(incidentFields)}
    }
  }
`;

// Attachments
export const GET_INCIDENT_ATTACHMENTS = gql`
  query getIncidentAttachments($incidentUid: String!, $pageableParam: PageableParamInput){
    getIncidentAttachments(incidentUid: $incidentUid, pageableParam: $pageableParam){
      ${pageGqlFields(incidentAttachmentFields)}
    }
  }
`;

export const GET_INCIDENT_ATTACHMENT_BY_UID = gql`
  query getIncidentAttachmentByUid($attachmentUid: String!){
    getIncidentAttachmentByUid(attachmentUid: $attachmentUid){
      ${responseGqlFields(`${incidentAttachmentFields}
        attachment`)}
    }
  }
`;

export const ADD_INCIDENT_ATTACHMENT = gql`
  mutation addIncidentAttachment($incidentUid: String!, $input: AttachmentDtoInput!){
    addIncidentAttachment(incidentUid: $incidentUid, input: $input){
      ${responseGqlFields(incidentAttachmentFields)}
    }
  }
`;

export const UPDATE_INCIDENT_ATTACHMENT = gql`
  mutation updateIncidentAttachment($attachmentUid: String!, $input: AttachmentDtoInput!){
    updateIncidentAttachment(attachmentUid: $attachmentUid, input: $input){
      ${responseGqlFields(incidentAttachmentFields)}
    }
  }
`;
