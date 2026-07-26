const ONES = [
  '',
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

function convertHundreds(num: number): string {
  let result = '';

  if (num >= 100) {
    result += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }

  if (num >= 20) {
    result += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }

  if (num > 0) {
    result += ONES[num] + ' ';
  }

  return result.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const parts: string[] = [];
  const units = ['', 'Thousand', 'Million', 'Billion'];

  let unitIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk) {
      parts.unshift(`${convertHundreds(chunk)} ${units[unitIndex]}`.trim());
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }

  return parts.join(' ').trim();
}
