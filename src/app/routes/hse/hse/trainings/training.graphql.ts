import { gql } from 'apollo-angular';
import {
  baseGqlFields,
  responseGqlFields,
  pageGqlFields,
} from '@shared/fetch/graphql.constants';

export const hseTrainingFields = `
  category
  type
  course
  plannedDate
  trainingInstitution
  trainingContent
  remarks
  status
  deliveryMode
  completedAt
  completedBy {
    uid
    username
    firstName
    lastName
  }
  createdBy {
    username
    firstName
    middleName
    lastName
  }
  ${baseGqlFields}
`;

export const hseTrainingAttendeeFields = `
  name
  contact
  designation
  section
  organization
  attended
  comment
  staff {
    uid
    username
    firstName
    middleName
    lastName
    email
  }
  ${baseGqlFields}
`;

// Scoped to the current user (BE looks up assignments for the caller).
// ⚠️ Backend has two known bugs today (see BACKEND_FIXES_NEEDED.md):
//   1. delegates to hseMeetingService.getMyAssigned instead of the
//      training service — will return meetings, not trainings.
//   2. no @PreAuthorize gate — should be locked to internal staff.
// Fields are identical to GET_ALL_HSE_TRAININGS so the same grid can
// render both once (1) is fixed BE-side.
export const GET_MY_HSE_TRAININGS = gql`
  query getMyHseTrainings($active: Boolean, $pageableParam: PageableParamInput){
    getMyHseTrainings(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseTrainingFields)}
    }
  }
`;

export const GET_ALL_HSE_TRAININGS = gql`
  query getAllHseTrainingsPageable($active: Boolean, $pageableParam: PageableParamInput){
    getAllHseTrainingsPageable(active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseTrainingFields)}
    }
  }
`;

export const GET_HSE_TRAINING_BY_UID = gql`
  query getHseTrainingByUid($uid: String!){
    getHseTrainingByUid(uid: $uid){
      ${responseGqlFields(hseTrainingFields)}
    }
  }
`;

export const SCHEDULE_OR_RESCHEDULE_HSE_TRAINING = gql`
  mutation scheduleOrRescheduleHseTraining($input: HseTrainingDtoInput!){
    scheduleOrRescheduleHseTraining(input: $input){
      ${responseGqlFields(hseTrainingFields)}
    }
  }
`;

export const DELETE_HSE_TRAINING = gql`
  mutation deleteHseTraining($uid: String!){
    deleteHseTraining(uid: $uid){
      ${responseGqlFields(hseTrainingFields)}
    }
  }
`;

export const MARK_HSE_TRAINING_AS_COMPLETED = gql`
  mutation markHseTrainingAsCompleted($trainingUid: String!, $remarks: String!){
    markHseTrainingAsCompleted(trainingUid: $trainingUid, remarks: $remarks){
      ${responseGqlFields(hseTrainingFields)}
    }
  }
`;

export const START_HSE_TRAINING = gql`
  mutation startHseTraining($trainingUid: String!){
    startHseTraining(trainingUid: $trainingUid){
      ${responseGqlFields(hseTrainingFields)}
    }
  }
`;

export const CANCEL_HSE_TRAINING = gql`
  mutation cancelHseTraining($trainingUid: String!, $remarks: String!){
    cancelHseTraining(trainingUid: $trainingUid, remarks: $remarks){
      ${responseGqlFields(hseTrainingFields)}
    }
  }
`;

// Attendees
export const GET_HSE_TRAINING_ATTENDEES_BY_TRAINING = gql`
  query getHseTrainingAttendeesByTraining($trainingUid: String!, $active: Boolean, $pageableParam: PageableParamInput){
    getHseTrainingAttendeesByTraining(trainingUid: $trainingUid, active: $active, pageableParam: $pageableParam){
      ${pageGqlFields(hseTrainingAttendeeFields)}
    }
  }
`;

export const GET_HSE_TRAINING_ATTENDEE_BY_UID = gql`
  query getHseTrainingAttendeeByUid($uid: String!){
    getHseTrainingAttendeeByUid(uid: $uid){
      ${responseGqlFields(hseTrainingAttendeeFields)}
    }
  }
`;

export const CREATE_OR_UPDATE_HSE_TRAINING_ATTENDEE = gql`
  mutation createOrUpdateHseTrainingAttendee($trainingUid: String!, $input: HseTrainingAttendeeDtoInput!){
    createOrUpdateHseTrainingAttendee(trainingUid: $trainingUid, input: $input){
      ${responseGqlFields(hseTrainingAttendeeFields)}
    }
  }
`;

export const DELETE_HSE_TRAINING_ATTENDEE = gql`
  mutation deleteHseTrainingAttendee($uid: String!){
    deleteHseTrainingAttendee(uid: $uid){
      ${responseGqlFields(hseTrainingAttendeeFields)}
    }
  }
`;

// Bulk set attendance: takes a list of { uid, attended, comment } (uid = attendee
// uid) + the training uid. Only valid while the training is ONGOING; returns
// Response<List<HseTrainingAttendee>> (the saved attendees under `data`).
export const SAVE_HSE_TRAINING_ATTENDANCE = gql`
  mutation saveOrUpdateHseTrainingAttendance($trainingUid: String!, $attendances: [AttendanceDtoInput]){
    saveOrUpdateHseTrainingAttendance(trainingUid: $trainingUid, attendances: $attendances){
      ${responseGqlFields(hseTrainingAttendeeFields)}
    }
  }
`;
