import {
  Gender,
  SecurityVettingRecommendation,
  SecurityVettingSubjectType,
} from '../shared/security.enums';

export interface SecurityVettingRecord {
  id?: number;
  uid?: string;
  referenceNumber?: string;
  station?: { uid?: string; name?: string };
  subjectType?: SecurityVettingSubjectType;
  staffUser?: { uid?: string; fullName?: string };
  guard?: { uid?: string; fullName?: string };
  relationshipType?: string;
  surname?: string;
  firstName?: string;
  middleName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  placeOfBirth?: string;
  idType?: string;
  idNumber?: string;
  phoneNumber?: string;
  email?: string;
  currentResidence?: string;
  recommendation?: SecurityVettingRecommendation;
  officerComments?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityVettingRecordDtoInput {
  uid?: string;
  stationUid?: string;
  subjectType?: SecurityVettingSubjectType;
  staffUserUid?: string;
  clientUid?: string;
  guardUid?: string;
  relationshipType?: string;
  surname?: string;
  firstName?: string;
  middleName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  placeOfBirth?: string;
  idType?: string;
  idNumber?: string;
  phoneNumber?: string;
  email?: string;
  currentResidence?: string;
  extendedDetailsJson?: string;
  recommendation?: SecurityVettingRecommendation;
  officerComments?: string;
}
