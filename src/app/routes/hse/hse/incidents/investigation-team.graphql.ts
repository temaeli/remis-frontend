import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const investigationTeamMemberFields = `
  name
  role
  ${baseGqlFields}
`;

export const GET_INCIDENT_INVESTIGATION_TEAM_MEMBERS_BY_INCIDENT = gql`
  query getIncidentInvestigationTeamMembersByIncident($incidentUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getIncidentInvestigationTeamMembersByIncident(incidentUid: $incidentUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(investigationTeamMemberFields)}
    }
  }
`;

export const GET_INCIDENT_INVESTIGATION_TEAM_MEMBER_BY_UID = gql`
  query getIncidentInvestigationTeamMemberByUid($uid: String!){
    getIncidentInvestigationTeamMemberByUid(uid: $uid){
      ${responseGqlFields(investigationTeamMemberFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_INCIDENT_INVESTIGATION_TEAM_MEMBER = gql`
  mutation createOrUpdateIncidentInvestigationTeamMember($input: IncidentInvestigationTeamMemberDtoInput!){
    createOrUpdateIncidentInvestigationTeamMember(input: $input){
      ${responseGqlFields(investigationTeamMemberFields)}
    }
  }
`;

export const DELETE_INCIDENT_INVESTIGATION_TEAM_MEMBER = gql`
  mutation deleteIncidentInvestigationTeamMember($uid: String!){
    deleteIncidentInvestigationTeamMember(uid: $uid){
      ${responseGqlFields(investigationTeamMemberFields)}
    }
  }
`;
