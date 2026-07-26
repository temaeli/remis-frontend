import { SubWard } from '@routes/settings/regions/subward/subward.form';
import { AttachmentDtoInput } from '@shared/components/generic-form/attachment/attachment.interface';
import { User } from 'app/routes/auth/auth.interface';
import { District } from 'app/routes/settings/regions/district/district.form';
import { Region } from 'app/routes/settings/regions/region.interface';
import { Ward } from 'app/routes/settings/regions/ward/ward.form';

export interface Inquiry {
  active?: boolean;
  attendee?: User;
  clientName?: string;
  closedBy?: User;
  createdAt?: string;
  createdBy?: User;
  createdById?: number;
  deletedAt?: string;
  deletedBy?: number;
  deletedId?: number;
  description?: string;
  destination?: InquiryDestination;
  district?: District;
  followupInquiry?: Inquiry;
  id?: number;
  inquiryCategory?: InquiryCategory;
  isDeleted?: boolean;
  migrated?: boolean;
  nature?: InquiryNature;
  otherNature?: string;
  phone?: string;
  priority?: InquiryPriority;
  region?: Region;
  status?: InquiryStatus;
  subWard?: SubWard;
  trackingId?: string;
  type?: InquiryType;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
  ward?: Ward;
  stage?: InquiryStage;

  assignments?: InquiryAssignment[];
}

export enum InquiryStage {
  DRAFT = 'DRAFT',
  MCC = 'MCC',
}
export interface InquiryDtoInput {
  attachments?: AttachmentDtoInput[];
  clientName?: string;
  description?: string;
  destination?: InquiryDestination;
  inquiryCategory?: InquiryCategory;
  nature?: InquiryNature;
  phone?: string;
  priority?: InquiryPriority;
  subWardUid?: string;
  trackingId?: string;
  type?: InquiryType;
  uid?: string;
}

export interface InquiryAssignment {
  active?: boolean;
  assignedBy?: User;
  assignee?: User;
  comment?: string;
  createdAt?: string;
  createdBy?: User;
  current?: boolean;
  deletedAt?: string;
  deletedBy?: number;
  id?: number;
  inquiry?: Inquiry;
  isDeleted?: boolean;
  migrated?: boolean;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface InquiryReply {
  active?: boolean;
  attendee?: User;
  comment?: string;
  createdAt?: string;
  createdBy?: User;
  deletedAt?: string;
  deletedBy?: number;
  id?: number;
  inquiry?: Inquiry;
  isDeleted?: boolean;
  migrated?: boolean;
  uid?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export enum InquiryNature {
  BILLING = 'BILLING',
  COMPLIMENT = 'COMPLIMENT',
  SERVICE_DELIVERY = 'SERVICE_DELIVERY',
  OTHER = 'OTHER',
  SAFETY = 'SAFETY',
  SECURITY = 'SECURITY',
  SUGGESTION = 'SUGGESTION',
  SUPPLY = 'SUPPLY',
  TECHNICAL = 'TECHNICAL',
}

export enum InquiryCategory {
  CNG = 'CNG',
  COMMUNITY = 'COMMUNITY',
  DISTRIBUTION = 'DISTRIBUTION',
  HOUSEHOLD = 'HOUSEHOLD',
  INDUSTRY = 'INDUSTRY',
  INSTITUTION = 'INSTITUTION',
  PIPELINE = 'PIPELINE',
  PLANT = 'PLANT',
}

export enum InquiryPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  NORMAL = 'NORMAL',
}

export enum InquiryStatus {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  ATTENDED = 'ATTENDED',
}

export enum InquiryType {
  COMPLAINT = 'COMPLAINT',
  FEEDBACK = 'FEEDBACK',
  REPORTING = 'REPORTING',
}

export enum InquiryDestination {
  DISTRIBUTION = 'DISTRIBUTION',
  FINANCE_AND_ADMINISTRATION = 'FINANCE_AND_ADMINISTRATION',
  LEGAL = 'LEGAL',
  PIPELINE = 'PIPELINE',
  PLANT = 'PLANT',
  PROCUREMENT = 'PROCUREMENT',
  SECURITY = 'SECURITY',
}
