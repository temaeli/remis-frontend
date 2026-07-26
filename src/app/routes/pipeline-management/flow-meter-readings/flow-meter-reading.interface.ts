export interface FlowMeterReading {
  id?: number;
  uid?: string;
  readingTime?: string;
  amount?: number;
  remarks?: string;
  comment?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: { uid?: string; username?: string; firstName?: string; lastName?: string };
  client?: {
    uid?: string;
    code?: string;
    accountNumber?: string;
    contactPersonName?: string;
    user?: { uid?: string; fullName?: string };
  };
  pipeline?: { uid?: string; name?: string };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFlowMeterReadingDtoInput {
  uid?: string;
  amount: number;
  remarks?: string;
  clientUid: string;
}

export interface FlowMeterReadingDtoInput {
  readingTime?: string;
  pipelineUid: string;
  readings: ClientFlowMeterReadingDtoInput[];
}

export interface DownstreamerClient {
  uid?: string;
  code?: string;
  accountNumber?: string;
  contactPersonName?: string;
  user?: { uid?: string; fullName?: string };
}

export function displayClient(
  c:
    | {
        code?: string;
        accountNumber?: string;
        contactPersonName?: string;
        user?: { fullName?: string };
      }
    | null
    | undefined,
): string {
  if (!c) return '';
  const raw = c.user?.fullName?.trim();
  const validFullName = raw && !raw.toLowerCase().startsWith('null') ? raw : undefined;
  return validFullName ?? c.accountNumber ?? c.contactPersonName ?? c.code ?? '';
}
