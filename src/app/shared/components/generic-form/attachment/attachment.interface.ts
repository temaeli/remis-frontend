export type FileExtension =
  | '.txt'
  | '.csv'
  | '.json'
  | '.xml'
  | '.pdf'
  | '.doc'
  | '.docx'
  | '.xls'
  | '.xlsx'
  | '.ppt'
  | '.pptx'
  | '.jpg'
  | '.jpeg'
  | '.png'
  | '.gif'
  | '.svg'
  | '.zip'
  | '.tar'
  | '.gz'
  | '.rar'
  | '.7z';

export interface FileChangeEvent {
  event: InputEvent;
  file: File;
  fileName: string;
  extension: string;
}

export const fileExtensionAttributeMap: Record<FileExtension, string> = {
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
};

export const MimeExtensionMap: Record<string, string> = {
  'application/json': '.json',
  'application/xml': '.xml',
  'application/x-www-form-urlencoded': '.txt',
  'application/javascript': '.js',
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/octet-stream': '.bin',
  'application/graphql': '.graphql',
  'text/html': '.html',
  'text/plain': '.txt',
  'text/css': '.css',
  'text/javascript': '.js',
  'text/csv': '.csv',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/webm': '.webm',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'font/woff': '.woff',
  'font/woff2': '.woff2',
  'font/ttf': '.ttf',
  'font/otf': '.otf',
  'multipart/form-data': '.txt',
};

export function getAcceptAttribute(extensions: FileExtension[]): string {
  if (!extensions.length) return '*';
  return extensions.map((ext) => fileExtensionAttributeMap[ext]).join(', ');
}

export interface BaseAttachment extends AttachmentDtoInput {
  fileName?: string;
  dataUrl?: string;
  extension?: string;
  file?: File;
  blob?: Blob;
  type?: string;
  attachmentTypeUid?: string;
}

export interface AttachmentDtoInput {
  attachmentTitle?: string;
  data?: string;
  dataBinary?: string;
  filePath?: string;
  fullPath?: string;
  id?: string;
  mediaSize?: string;
  mediaType?: string;
  sourceId?: string;
  sourceName?: AttachmentSourceNameEnum;
}

export enum AttachmentSourceNameEnum {
  CLIENT = 'CLIENT',
  INCIDENT = 'INCIDENT',
  INSPECTION = 'INSPECTION',
  MEETING_ATTENDANCE = 'MEETING_ATTENDANCE',
  MEETING_MINUTES = 'MEETING_MINUTES',
  OTHERS = 'OTHERS',
  PLANT = 'PLANT',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  SECURITY_INCIDENT = 'SECURITY_INCIDENT',
  SECURITY_INVESTIGATION = 'SECURITY_INVESTIGATION',
  SECURITY_FORM_SUBMISSION = 'SECURITY_FORM_SUBMISSION',
  SECURITY_GATE_PASS = 'SECURITY_GATE_PASS',
  SECURITY_ACCESS_EVENT = 'SECURITY_ACCESS_EVENT',
}
