import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  pageGqlFields,
  plainResponseGqlFields,
  responseGqlFields,
} from '@shared/fetch/graphql.constants';

export const flowMeterReadingGqlFields = `
  readingTime
  amount
  remarks
  comment
  submittedAt
  approvedAt
  approvedBy {
    uid
    username
    firstName
    lastName
  }
  rejectedAt
  rejectedBy {
    uid
    username
    firstName
    lastName
  }
  client {
    uid
    code
    accountNumber
    contactPersonName
    user {
      uid
      fullName
    }
  }
  pipeline {
    uid
    name
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const downstreamerClientGqlFields = `
  uid
  code
  accountNumber
  contactPersonName
  user {
    uid
    fullName
  }
`;

export const GET_ALL_FLOW_METER_READINGS_PAGEABLE = gql`
  query getAllFlowMeterReadingsPageable($pageableParam: PageableParamInput, $active: Boolean) {
    getAllFlowMeterReadingsPageable(pageableParam: $pageableParam, active: $active) {
      ${pageGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const GET_FLOW_METER_READINGS_BY_PIPELINE = gql`
  query getFlowMeterReadingsByPipeline(
    $pipelineUid: String!
    $pageableParam: PageableParamInput
    $active: Boolean
  ) {
    getFlowMeterReadingsByPipeline(
      pipelineUid: $pipelineUid
      pageableParam: $pageableParam
      active: $active
    ) {
      ${pageGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const GET_FLOW_METER_READINGS_BY_CLIENT = gql`
  query getFlowMeterReadingsByClient(
    $clientUid: String!
    $pageableParam: PageableParamInput
    $active: Boolean
  ) {
    getFlowMeterReadingsByClient(
      clientUid: $clientUid
      pageableParam: $pageableParam
      active: $active
    ) {
      ${pageGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const GET_FLOW_METER_READING_BY_UID = gql`
  query getFlowMeterReadingByUid($uid: String!) {
    getFlowMeterReadingByUid(uid: $uid) {
      ${responseGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const SAVE_FLOW_METER_READING = gql`
  mutation saveFlowMeterReading($input: FlowMeterReadingDtoInput!) {
    saveFlowMeterReading(input: $input) {
      ${plainResponseGqlFields}
    }
  }
`;

export const UPDATE_FLOW_METER_READING = gql`
  mutation updateFlowMeterReading($input: FlowMeterReadingDtoInput!) {
    updateFlowMeterReading(input: $input) {
      ${plainResponseGqlFields}
    }
  }
`;

export const SUBMIT_FLOW_METER_READING = gql`
  mutation submitFlowMeterReading($uid: String!) {
    submitFlowMeterReading(uid: $uid) {
      ${responseGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const APPROVE_FLOW_METER_READING = gql`
  mutation approveFlowMeterReading($uid: String!, $comment: String!) {
    approveFlowMeterReading(uid: $uid, comment: $comment) {
      ${responseGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const REJECT_FLOW_METER_READING = gql`
  mutation rejectFlowMeterReading($uid: String!, $comment: String!) {
    rejectFlowMeterReading(uid: $uid, comment: $comment) {
      ${responseGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const DELETE_FLOW_METER_READING = gql`
  mutation deleteFlowMeterReading($uid: String!) {
    deleteFlowMeterReading(uid: $uid) {
      ${responseGqlFields(flowMeterReadingGqlFields)}
    }
  }
`;

export const GET_DOWNSTREAMER_CLIENTS_BY_PIPELINE = gql`
  query getDownstreamerClientsByPipeline(
    $pipelineUid: String!
    $pageableParam: PageableParamInput
  ) {
    getDownstreamerClientsByPipeline(pipelineUid: $pipelineUid, pageableParam: $pageableParam) {
      ${pageGqlFields(downstreamerClientGqlFields)}
    }
  }
`;
