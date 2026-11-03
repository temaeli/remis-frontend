import { gepgLogText, isFailure, prettyXml, shortenSignature } from './gepg-log.helpers';

/** The rejection GePG sent on 2026-11-03 for WHI-CC08000199797-20261103-3, signature cut short. */
const REJECTED =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Gepg><billSubRes><BillHdr>' +
  '<ResSts>GF</ResSts><ResStsCode>7201</ResStsCode></BillHdr><BillDtls><BillDtl>' +
  '<BillStsCode>7223</BillStsCode><BillStsDesc>Invalid or inactive gfs or service type</BillStsDesc>' +
  '</BillDtl></BillDtls></billSubRes>' +
  '<signature>UhEAV22oo/i/vBsxxNswGoYkxv2KhpOJYkNwF6wzRMUBoeMhkDUvYF2IewA2jqkLtnfFPAX2Rm</signature></Gepg>';

describe('prettyXml', () => {
  it('puts one tag per line, indented, keeping a tag and its text together', () => {
    expect(prettyXml(REJECTED).split('\n').slice(0, 6)).toEqual([
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Gepg>',
      '  <billSubRes>',
      '    <BillHdr>',
      '      <ResSts>GF</ResSts>',
      '      <ResStsCode>7201</ResStsCode>',
    ]);
    expect(prettyXml(REJECTED).split('\n').at(-1)).toBe('</Gepg>');
  });
});

describe('shortenSignature', () => {
  it('cuts the signature for the screen', () => {
    expect(shortenSignature(REJECTED)).toContain(
      '<signature>UhEAV22oo/i/vBsxxNswGoYkxv2KhpOJYkNwF6wz… (shortened)</signature>',
    );
  });
});

describe('isFailure', () => {
  it('spots a rejection and passes a success', () => {
    expect(
      isFailure({ summary: 'GePG code 7201 · GF · 7223 Invalid or inactive gfs or service type' }),
    ).toBe(true);
    expect(isFailure({ summary: 'BLHX-1 :: bill submission :: 7101 :: Successful' })).toBe(false);
  });
});

describe('gepgLogText', () => {
  it('lists every step with its XML, and marks the failure', () => {
    const text = gepgLogText(
      { id: 'x', assignedNumber: 'BLHX-GAMK4-17NX-0971', grpBillId: 'WHI-CC08000199797-20261103-3' },
      [
        {
          uid: '1',
          step: 'Response',
          flow: 'Control number',
          summary: 'GePG code 7201 · GF · 7223 Invalid or inactive gfs or service type',
          payload: REJECTED,
          occurredAt: '2026-11-03T12:19:43',
        },
      ],
      'Obadia Mayunga',
    );
    expect(text).toContain('Bill header:   BLHX-GAMK4-17NX-0971');
    expect(text).toContain('Control number · Response · FAILED');
    expect(text).toContain('      <BillStsCode>7223</BillStsCode>');
    // The download keeps the whole signature.
    expect(text).toContain('UhEAV22oo/i/vBsxxNswGoYkxv2KhpOJYkNwF6wzRMUBoeMhkDUvYF2IewA2jqkLtnfFPAX2Rm');
  });
});
