/**
 * The plain parts of the GePG Log: no Angular, so they can be unit tested.
 */

export interface GepgLogHeader {
  /** The bill header's uuid. */
  id: string;
  /** BLHX-… */
  assignedNumber?: string;
  /** WHI-… */
  grpBillId?: string;
}

export interface GepgLogStep {
  uid: string;
  occurredAt?: string;
  step: string;
  reference?: string;
  summary?: string;
  payload?: string;
  /** Which conversation: Control number, Reuse, Expiry change, Cancellation. */
  flow: string;
}

/** A step that says GePG refused something. */
export const isFailure = (s: Pick<GepgLogStep, 'summary'>): boolean =>
  /\bGF\b|\b7201\b|fail|reject|invalid/i.test(s.summary ?? '');

/** One tag per line, indented by depth. A tag with its text stays on one line. */
export function prettyXml(xml: string): string {
  const lines = xml.trim().replace(/>\s*</g, '>\n<').split('\n');
  let depth = 0;
  return lines
    .map((line) => {
      const closing = /^<\//.test(line);
      // An opening tag alone on its line: not closing, not self-closing, not <?xml.
      const opening = /^<[^!?/][^>]*>$/.test(line) && !/\/>$/.test(line);
      if (closing) depth = Math.max(depth - 1, 0);
      const out = '  '.repeat(depth) + line;
      if (opening) depth++;
      return out;
    })
    .join('\n');
}

/** The signature is long and says nothing to a reader; shortened on screen only. */
export const shortenSignature = (xml: string): string =>
  xml.replace(
    /<signature>([^<]{40})[^<]*<\/signature>/,
    (_m, start: string) => `<signature>${start}… (shortened)</signature>`,
  );

const when = (value?: string): string =>
  value ? new Date(value).toLocaleString('en-GB', { hour12: false }) : 'No date';

/** The whole log as plain text: what Download saves and what Print lays out. */
export function gepgLogText(
  header: GepgLogHeader,
  steps: GepgLogStep[],
  producedBy: string,
  producedAt: Date = new Date(),
): string {
  const head = [
    'GePG LOG',
    `Bill header:   ${header.assignedNumber ?? header.id}`,
    `Group bill id: ${header.grpBillId ?? '-'}`,
    `Produced by:   ${producedBy || '-'}`,
    `Produced on:   ${when(producedAt.toISOString())}`,
    `Steps:         ${steps.length}`,
    '',
  ];
  const body = steps.flatMap((s, i) => [
    '='.repeat(78),
    `${i + 1}. ${when(s.occurredAt)} · ${s.flow} · ${s.step}${isFailure(s) ? ' · FAILED' : ''}`,
    `Reference: ${s.reference ?? '-'}`,
    `What happened: ${s.summary ?? '-'}`,
    ...(s.payload ? ['', prettyXml(s.payload)] : []),
    '',
  ]);
  return [...head, ...body].join('\n');
}

export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
