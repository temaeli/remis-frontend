import { BehaviorSubject } from 'rxjs';
import { FetchParameter } from '@shared/fetch/fetch.interface';
import { CrudHost } from './crud-host';

// ResponseCode.NEEDS_CONFIRMATION on the backend (see Response.java / ResponseCode).
const NEEDS_CONFIRMATION_CODE = 9018;

/**
 * Wrap a mutation that may return code 9018 (NEEDS_CONFIRMATION).
 *
 * If the first call returns 9018, prompt the user with the backend's message and —
 * if confirmed — retry with `ignoreWarning: true` merged into `variables.input`.
 * Otherwise the call behaves like a plain `host.fetch(fp)`.
 *
 * Why: services like `PipelineReadingService.create/update/submit` re-validate
 * pressure ranges and return 9018 + a human-readable message when a value is
 * outside the section's min/max. The flow expects the client to ask the user,
 * then retry with `ignoreWarning: true`.
 */
export async function fetchWithWarningConfirm(host: CrudHost, fp: FetchParameter): Promise<any> {
  const res$ = new BehaviorSubject<any>(undefined);

  await host.fetch({ ...fp, notifyError: false, res$ });
  const res = res$.getValue();

  if (res?.code !== NEEDS_CONFIRMATION_CODE) {
    return res?.hasOwnProperty('data') ? res.data : res;
  }

  const confirmed = await host.confirm({
    title: 'Please confirm',
    message: res.message ?? 'Please confirm to proceed.',
    confirmText: 'Proceed',
  });
  if (!confirmed) return undefined;

  const retryVars = {
    ...(fp.variables ?? {}),
    input: {
      ...(fp.variables?.input ?? {}),
      ignoreWarning: true,
    },
  };

  return host.fetch({ ...fp, variables: retryVars });
}
