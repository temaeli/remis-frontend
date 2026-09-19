import { baseGqlFields, responseGqlFields } from '@shared/fetch/graphql.constants';
import { gql } from 'apollo-angular';

export const attachmentGqlFields = `
  attachmentTitle
  extraIdentifier
  filePath
  isDeleted
  mediaSize
  mediaType
    sourceId
  sourceName
  ${baseGqlFields}
`;

export const attachmentDtoGqlFields = `
  attachmentTitle
  data
  dataBinary
  filePath
  fullPath
  id
  mediaSize
  mediaType
  sourceId
  sourceName
`;

export const UPLOAD_ATTACHMENT = gql`
  mutation uploadAttachment($attachmentDto: AttachmentDtoInput ) {
    uploadAttachment(attachmentDto: $attachmentDto ) {
      ${responseGqlFields(attachmentGqlFields)}
    }
  }
`;

export const UPLOAD_PROFILE_PHOTO = gql`
  mutation uploadProfilePhoto($attachmentDto: AttachmentDtoInput ) {
    uploadProfilePhoto(attachmentDto: $attachmentDto ) {
      ${responseGqlFields(attachmentGqlFields)}
    }
  }
`;
export const LIST_ATTACHMENTS_BY_SOURCE_NAME_AND_ID = gql`
  query listAttachmentsBySourceNameAndId($sourceId: String, $sourceName: AttachmentSourceNameEnum  ) {
    listAttachmentsBySourceNameAndId(sourceId: $sourceId, sourceName: $sourceName ) {
      ${responseGqlFields(attachmentGqlFields)}
    }
  }
`;
export const LIST_ATTACHMENTS_BY_SOURCE_ID = gql`
  query listAttachmentsBySourceUid($sourceUid: String) {
    listAttachmentsBySourceUid(sourceUid: $sourceUid) {
      ${attachmentGqlFields}
    }
  }
`;

export const GET_ATTACHMENT_BY_UID = gql`
  query getAttachmentByUid($attachmentUid: String!) {
    getAttachmentByUid(attachmentUid: $attachmentUid) {
      ${responseGqlFields(`
        ${attachmentGqlFields}
        attachment
      `)}
    }
  }
`;

export const READ_ATTACHMENT = gql`
  query readAttachment($filePath: String ) {
    readAttachment(filePath: $filePath ) {
      ${responseGqlFields(attachmentDtoGqlFields)}
    }
  }
`;

export const SINGLE_ATTACHMENT_BY_SOURCE_NAME_AND_ID = gql`
  query singleAttachmentBySourceNameAndId($sourceId: String, $sourceName: AttachmentSourceNameEnum  ) {
    singleAttachmentBySourceNameAndId(sourceId: $sourceId, sourceName: $sourceName ) {
      ${responseGqlFields(attachmentDtoGqlFields)}
    }
  }
`;

export const DELETE_ATTACHMENT = gql`
  mutation deleteAttachment($id: Long) {
    deleteAttachment(id: $id)
  }
`;
