import { jsPDF } from 'jspdf';

/**
 * The three papers the GePG guide ("Mwongozo wa namna ya kuandaa ankara,
 * kufanya malipo na risiti za GePG", ver 1.0) asks an institution to print:
 *
 *   - the government bill, with how to pay it              (its appendix 3)
 *   - the transfer bill, for a payer moving money by TISS or SWIFT (appendix 2)
 *   - the receipt, for a payment GePG has reported          (appendix 1)
 *
 * Each is laid out after the guide's own sample and opened as a PDF, so what is
 * handed to a payer or a bank is what the guide shows. The institution named at
 * the top is the bill's service provider code -- `spcodes.name`.
 *
 * The samples carry a QR code for the mobile money apps. It is left out: the
 * guide does not say what the code holds, and a code that scans to the wrong
 * thing is worse than none.
 */

/** Who is printing, and when. The guide puts both on every paper. */
export interface PrintedBy {
  user: string;
  at: Date;
}

/** One internal bank account kept in the bill's currency: where the bill is paid into. */
export interface CollectionAccount {
  bank: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
}

export interface BillPaper {
  institution: string;
  controlNumber: string;
  paymentReference: string;
  serviceProviderCode: string;
  payerName: string;
  payerPhone: string;
  description: string;
  items: { description: string; amount: number }[];
  total: number;
  /** The three-letter code, as on `currencies.assigned_code`. */
  currencyCode: string;
  /** The currency's name, for the amount in words. */
  currencyName: string;
  expiresOn?: string | Date | null;
  collectionCentre: string;
  accounts: CollectionAccount[];
}

export interface ReceiptPaper {
  institution: string;
  receiptNumber: string;
  receivedFrom: string;
  amount: number;
  outstandingBalance: number;
  items: { description: string; amount: number }[];
  totalBilled: number;
  currencyCode: string;
  currencyName: string;
  billReference: string;
  paymentControlNumber: string;
  paymentDate?: string | Date | null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `17-May-2019`, as the guide's samples write a date. */
export const paperDate = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${`${date.getDate()}`.padStart(2, '0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
};

/** `65,000.00`. */
export const paperMoney = (amount?: number | null): string =>
  Number(amount ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ONES = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion'];

/** A number below one thousand, in words. */
const belowThousand = (n: number): string => {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(n % 10 ? `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}` : TENS[Math.floor(n / 10)]);
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(' ');
};

/** A whole number in words: `65000` is `Sixty-Five Thousand`. */
const wholeInWords = (whole: number): string => {
  if (whole === 0) return ONES[0];
  const groups: string[] = [];
  let scale = 0;
  while (whole > 0 && scale < SCALES.length) {
    const group = whole % 1000;
    if (group) groups.unshift(`${belowThousand(group)}${SCALES[scale] ? ` ${SCALES[scale]}` : ''}`);
    whole = Math.floor(whole / 1000);
    scale++;
  }
  return groups.join(' ');
};

/**
 * The amount in words, as the guide requires beside the amount in figures:
 * `Sixty-Five Thousand Tanzanian Shilling Only.` Cents, when there are any, are
 * said after the whole amount.
 */
export const amountInWords = (amount: number | null | undefined, currencyName: string): string => {
  const value = Math.round(Math.abs(Number(amount ?? 0)) * 100);
  const whole = Math.floor(value / 100);
  const cents = value % 100;
  const currency = currencyName?.trim() || '';
  const main = `${wholeInWords(whole)}${currency ? ` ${currency}` : ''}`;
  return cents ? `${main} and ${wholeInWords(cents)} Cents Only.` : `${main} Only.`;
};

/** The banks a bill can be paid at: the ones the institution collects into. */
const bankNames = (accounts: CollectionAccount[]): string => {
  const names = [...new Set(accounts.map((a) => a.bank?.trim()).filter(Boolean))];
  return names.length ? names.join(', ') : 'any bank connected to GePG';
};

/**
 * How to pay a bill, in Swahili and in English, worded as the guide's sample
 * bill words it. The banks named are the institution's own collection banks for
 * the bill's currency, as the guide asks.
 */
export const howToPay = (
  controlNumber: string,
  accounts: CollectionAccount[],
): { swahili: string[]; english: string[] } => {
  const banks = bankNames(accounts);
  return {
    swahili: [
      `1. Kupitia Benki: Fika tawi lolote au wakala wa benki ya ${banks}. Namba ya kumbukumbu: ${controlNumber}.`,
      '2. Kupitia Mitandao ya Simu:',
      '   - Ingia kwenye menyu ya mtandao husika',
      '   - Chagua 4 (Lipa Bili)',
      '   - Chagua 5 (Malipo ya Serikali)',
      `   - Ingiza ${controlNumber} kama namba ya kumbukumbu`,
    ],
    english: [
      `1. Via Bank: Visit any branch or bank agent of ${banks}. Reference Number: ${controlNumber}.`,
      '2. Via Mobile Network Operators (MNO): Enter to the respective USSD Menu of MNO',
      '   - Select 4 (Make Payments)',
      '   - Select 5 (Government Payments)',
      `   - Enter ${controlNumber} as reference number`,
    ],
  };
};

/** The coat of arms, read once and kept: every paper carries it at the top. */
let emblem: Promise<string | null> | null = null;
const loadEmblem = (): Promise<string | null> => {
  emblem ??= fetch('images/emblem.png')
    .then((response) => (response.ok ? response.blob() : Promise.reject(new Error('no emblem'))))
    .then(
      (blob) =>
        new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        }),
    )
    // A paper without the emblem is still a paper; one that will not open is not.
    .catch(() => null);
  return emblem;
};

const PAGE_WIDTH = 595;
const LEFT = 60;
const RIGHT = PAGE_WIDTH - 60;
const VALUE_X = 215;
const BLUE: [number, number, number] = [28, 60, 140];
const BLACK: [number, number, number] = [20, 20, 20];

/** A pen that walks down one page, so each paper is written as a list of lines. */
class Paper {
  readonly doc = new jsPDF('portrait', 'pt', 'a4');
  y = 50;
  /** The space left under each row. A paper with much to say closes it up to stay on one page. */
  gap = 7;

  private text(value: string, x: number, bold = false, size = 10, align?: 'center' | 'right') {
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(size);
    this.doc.text(value, x, this.y, align ? { align } : undefined);
  }

  /** The emblem and the three centred lines every paper opens with. */
  heading(emblemData: string | null, institution: string, title: string, subtitle?: string) {
    if (emblemData) {
      this.doc.addImage(
        emblemData,
        'PNG',
        PAGE_WIDTH / 2 - 27,
        this.y - 10,
        54,
        54,
        'emblem',
        'FAST',
      );
      this.y += 62;
    }
    this.doc.setTextColor(...BLUE);
    this.text('United Republic of Tanzania', PAGE_WIDTH / 2, false, 10, 'center');
    this.y += 16;
    this.text(institution || '', PAGE_WIDTH / 2, true, 12, 'center');
    this.y += 16;
    this.text(title, PAGE_WIDTH / 2, false, 10, 'center');
    if (subtitle) {
      this.y += 14;
      this.text(subtitle, PAGE_WIDTH / 2, false, 10, 'center');
    }
    this.doc.setTextColor(...BLACK);
    this.y += 10;
    this.rule();
    this.y += 20;
  }

  rule(dashed = true) {
    this.doc.setDrawColor(150);
    this.doc.setLineDashPattern(dashed ? [1.5, 1.5] : [], 0);
    this.doc.line(LEFT, this.y, RIGHT, this.y);
    this.doc.setLineDashPattern([], 0);
  }

  /** `Label      : value`, the value wrapped when it is long. */
  row(label: string, value: string, bold = false, valueX = VALUE_X) {
    this.text(label, LEFT + 20);
    const lines: string[] = this.doc.splitTextToSize(`: ${value ?? ''}`, RIGHT - valueX);
    for (const line of lines) {
      this.text(line, valueX, bold);
      this.y += 14;
    }
    this.y += this.gap;
  }

  /** A billed line: its description on the left, its amount on the right. */
  item(label: string, description: string, amount: string, bold = false) {
    this.text(label, LEFT + 20, bold);
    const lines: string[] = this.doc.splitTextToSize(`: ${description}`, RIGHT - VALUE_X - 80);
    this.text(`: ${amount}`, RIGHT - 20, bold, 10, 'right');
    for (const line of lines) {
      this.text(line, VALUE_X, bold);
      this.y += 14;
    }
    this.y += this.gap;
  }

  paragraph(lines: string[], x: number, width: number, size = 8) {
    const start = this.y;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(size);
    for (const line of lines) {
      const wrapped: string[] = this.doc.splitTextToSize(line, width);
      this.doc.text(wrapped, x, this.y);
      this.y += wrapped.length * (size + 3);
    }
    const end = this.y;
    this.y = start;
    return end;
  }

  note(value: string, bold = false, size = 8) {
    this.text(value, LEFT + 20, bold, size);
    this.y += size + 5;
  }

  footer() {
    this.doc.setTextColor(...BLUE);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(7);
    this.doc.text('Government e Payment Gateway (GePG)', PAGE_WIDTH / 2, 800, { align: 'center' });
    this.doc.setTextColor(...BLACK);
  }

  nextPage() {
    this.doc.addPage();
    this.y = 50;
  }

  /** Opens the paper in a new tab to be printed, or saves it where a tab is refused. */
  open(fileName: string) {
    const url = this.doc.output('bloburl');
    if (!window.open(url, '_blank')) this.doc.save(`${fileName}.pdf`);
  }
}

/** The lines both bills end with: who prepared and printed it, and where it is collected. */
const billClosing = (paper: Paper, bill: BillPaper, by: PrintedBy) => {
  paper.row('Expires on', paperDate(bill.expiresOn));
  paper.row('Prepared By', by.user, true);
  paper.row('Prepared on', paperDate(by.at));
  paper.row('Collection Centre', bill.collectionCentre);
  paper.row('Printed By', by.user);
  paper.row('Printed on', paperDate(by.at));
  paper.row('Signature', '.......................................');
};

/** The government bill: what is owed, by whom, on which control number, and how to pay it. */
export async function printGovernmentBill(bill: BillPaper, by: PrintedBy): Promise<void> {
  const paper = new Paper();
  paper.heading(await loadEmblem(), bill.institution, 'Government Bill');

  paper.row('Control Number', bill.controlNumber, true);
  paper.row('Payment Ref', bill.paymentReference, true);
  paper.row('Service Provider Code', bill.serviceProviderCode, true);
  paper.row('Payer Name', bill.payerName);
  paper.row('Payer Phone', bill.payerPhone);
  paper.row('Bill Description', bill.description);
  paper.rule();
  paper.y += 16;
  bill.items.forEach((line, index) =>
    paper.item(`Billed Item (${index + 1})`, line.description, paperMoney(line.amount)),
  );
  paper.rule();
  paper.y += 16;
  paper.item('', 'Total Billed Amount', `${paperMoney(bill.total)} (${bill.currencyCode})`, true);
  paper.row('Amount in Words', amountInWords(bill.total, bill.currencyName), true);
  billClosing(paper, bill, by);

  paper.y += 6;
  const steps = howToPay(bill.controlNumber, bill.accounts);
  const half = (RIGHT - LEFT - 40) / 2;
  paper.doc.setFont('helvetica', 'bold');
  paper.doc.setFontSize(8);
  paper.doc.text('Jinsi ya Kulipa', LEFT + 20, paper.y);
  paper.doc.text('How to Pay', LEFT + 30 + half, paper.y);
  paper.y += 12;
  paper.paragraph(steps.swahili, LEFT + 20, half - 10);
  paper.paragraph(steps.english, LEFT + 30 + half, half - 10);

  paper.footer();
  paper.open(`bill-${bill.controlNumber}`);
}

/**
 * The transfer bill, one page for each account on `bill.accounts`. An institution
 * can keep a great many accounts in one currency, so the screen asks which one
 * and hands over only that. The payer takes it to their own bank as it is: field 59 of
 * the MT103 is the beneficiary account, and field 70 the control number with
 * `/ROC/` before it, exactly as the guide gives them.
 */
export async function printTransferForm(bill: BillPaper, by: PrintedBy): Promise<void> {
  const paper = new Paper();
  paper.gap = 2;
  const emblemData = await loadEmblem();

  bill.accounts.forEach((account, index) => {
    if (index > 0) paper.nextPage();
    paper.heading(
      emblemData,
      bill.institution,
      `Order Form for Electronic Funds Transfer to ${account.bank}`,
    );

    paper.note('(a). Remitter / Tax Payer Details :-', true, 9);
    paper.y += 6;
    paper.row(
      'Name of Account Holder(s)',
      '....................................................................',
    );
    paper.row(
      'Name of Commercial Bank',
      '....................................................................',
    );
    paper.row(
      'Bank Account Number',
      '....................................................................',
    );
    paper.row('Signatories', '..............................  |  ..............................');
    paper.y += 4;

    paper.note('(b). Beneficiary Details :-', true, 9);
    paper.y += 6;
    paper.row('Beneficiary Name', account.accountName, true);
    paper.row('Bank', account.bank, true);
    paper.row('Account Number', account.accountNumber, true);
    paper.row('SWIFT Code', account.swiftCode, true);
    paper.row('Control Number', bill.controlNumber, true);
    paper.row('Beneficiary Account (Field 59 of MT103)', `/${account.accountNumber}`, true, 280);
    paper.row('Payment Reference (Field 70 of MT103)', `/ROC/${bill.controlNumber}`, true, 280);
    paper.row('Transfer Amount', `${paperMoney(bill.total)} (${bill.currencyCode})`, true);
    paper.row('Amount in Words', amountInWords(bill.total, bill.currencyName), true);
    paper.row('Being payment for', bill.description);
    paper.rule();
    paper.y += 16;
    bill.items.forEach((line, i) =>
      paper.item(`Billed Item (${i + 1})`, line.description, paperMoney(line.amount)),
    );
    paper.rule();
    paper.y += 16;
    billClosing(paper, bill, by);

    paper.note('Note to Commercial Bank:', true);
    paper.note(
      '1. Please capture the above information correctly. Do not change or add any text, symbols or digits on the information provided.',
    );
    paper.note(
      `2. Field 59 of MT103 is an "Account Number" with value: /${account.accountNumber}. Must be captured correctly.`,
    );
    paper.note(
      `3. Field 70 of MT103 is a "Control Number" with value: /ROC/${bill.controlNumber}. Must be captured correctly.`,
    );
    paper.footer();
  });

  paper.open(`transfer-${bill.controlNumber}`);
}

/** The receipt for one payment GePG has reported against a bill. */
export async function printReceipt(receipt: ReceiptPaper, by: PrintedBy): Promise<void> {
  const paper = new Paper();
  paper.heading(
    await loadEmblem(),
    receipt.institution,
    'Exchequer Receipts',
    'Stakabadhi ya Malipo ya Serikali',
  );

  paper.row('Receipt No', receipt.receiptNumber, true);
  paper.row('Received from', receipt.receivedFrom, true);
  paper.row('Amount', `${paperMoney(receipt.amount)} (${receipt.currencyCode})`);
  paper.row('Amount in Words', amountInWords(receipt.amount, receipt.currencyName));
  paper.row(
    'Outstanding Balance',
    `${paperMoney(receipt.outstandingBalance)} (${receipt.currencyCode})`,
  );
  paper.item('In respect of', 'Item Description(s)', 'Item Amount', true);
  paper.rule(false);
  paper.y += 16;
  receipt.items.forEach((line) => paper.item('', line.description, paperMoney(line.amount)));
  paper.rule(false);
  paper.y += 16;
  paper.item(
    '',
    'Total Billed Amount',
    `${paperMoney(receipt.totalBilled)} (${receipt.currencyCode})`,
    true,
  );
  paper.y += 6;
  paper.row('Bill Reference', receipt.billReference);
  paper.row('Payment Control Number', receipt.paymentControlNumber, true);
  paper.row('Payment Date', paperDate(receipt.paymentDate));
  paper.row('Issued by', by.user);
  paper.row('Date Issued', paperDate(by.at));
  paper.row('Signature', '.......................................');

  paper.footer();
  paper.open(`receipt-${receipt.receiptNumber}`);
}

/** Bank and account names are typed in by a clerk, and this is put on the page as markup. */
const escapeHtml = (value?: string | null): string =>
  `${value ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * How to pay, for the bill's own page: the guide's instructions for each mobile
 * network, for a bank deposit and for a transfer, with this bill's control
 * number and this institution's banks written in.
 */
export const howToPayHtml = (issued: string | null, accounts: CollectionAccount[]): string => {
  const controlNumber = escapeHtml(issued);
  if (!controlNumber) {
    return `<p><b>This bill has no control number yet.</b> It cannot be paid until GePG issues one.
      Request a control number, then come back here.</p>`;
  }
  const banks = escapeHtml(bankNames(accounts));
  const list = 'list-decimal ml-6 mb-3';
  const network = (name: string, dial: string, steps: string[]) =>
    `<p class="font-semibold">${name}</p><ol class="${list}"><li>Piga ${dial}</li>${steps
      .map((s) => `<li>${s}</li>`)
      .join('')}</ol>`;
  const number = `Ingiza namba ya kumbukumbu ya malipo: <b>${controlNumber}</b>`;
  // The accounts themselves are not listed: there can be a hundred in one
  // currency. The one to transfer to is chosen when the form is printed.
  const transfer = accounts.length
    ? '<p>Bonyeza <b>Print Transfer Form</b>, chagua akaunti ya benki unayotaka, na fomu itaonyesha akaunti hiyo pekee.</p>'
    : '<p>Hakuna akaunti ya ndani ya makusanyo iliyowekwa kwa sarafu ya ankara hii.</p>';

  return `
    <p class="text-lg font-semibold mb-3">Namba ya kumbukumbu ya malipo (Control Number): ${controlNumber}</p>
    <p class="font-semibold text-primary mb-2">Kwa njia ya simu za kiganjani</p>
    ${network('Tigopesa', '*150*01#', ['Chagua 4 "Lipa Bili"', 'Chagua 5 "Malipo ya Serikali"', number, 'Ingiza kiasi cha pesa unachotaka kulipa', 'Ingiza namba ya siri kuhakiki'])}
    ${network('M-Pesa', '*150*00#', ['Chagua 4 "Lipa kwa M-Pesa"', 'Chagua 5 "Malipo ya Serikali"', 'Chagua 1 "Namba ya Malipo"', number, 'Ingiza kiasi cha pesa unachotaka kulipa', 'Ingiza namba ya siri', 'Thibitisha kwa kuchagua 1'])}
    ${network('Airtel Money', '*150*60#', ['Chagua 5 "Lipia Bili"', 'Chagua 5 "Malipo ya Serikali"', 'Chagua 1 "Weka namba ya kumbukumbu"', number, 'Ingiza kiasi cha pesa', 'Weka namba ya siri'])}
    ${network('T-Pesa', '*150*71#', ['Chagua 5 "Lipia Bili"', 'Chagua 3 "Malipo ya Serikali"', number, 'Ingiza kiasi', 'Ingiza namba ya siri'])}
    ${network('Halopesa', '*150*88#', ['Chagua 5 "Lipia Bili"', 'Chagua 5 "Malipo ya Serikali"', number, 'Ingiza kiasi cha pesa', 'Weka namba ya siri'])}
    ${network('Ezypesa', '*150*02#', ['Chagua 8 "Malipo ya Serikali"', 'Chagua 1 "Tanzania Bara"', number, 'Ingiza kiasi cha pesa', 'Weka namba ya siri'])}
    <p class="font-semibold text-primary mb-2">Kwa njia ya kuweka fedha benki (Direct Bank Deposit)</p>
    <p class="mb-3">Fika tawi lolote au wakala wa benki ya <b>${banks}</b>, na utumie namba ya kumbukumbu ya malipo
      <b>${controlNumber}</b> unapofanya malipo.</p>
    <p class="font-semibold text-primary mb-2">Kwa njia ya kuhamisha fedha (TISS / SWIFT)</p>
    <p class="mb-2">Chapisha fomu ya kuhamishia fedha (Transfer Form) ya ankara hii na uiwasilishe benki bila kuijaza upya.</p>
    ${transfer}
  `;
};
