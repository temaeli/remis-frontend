import {
  FIRST_20_NUMBERS_IN_WORDS,
  IRREGULAR_SINGULAR_PLURAL_PAIRS,
  LOWERS,
  NUMBERS_BASE,
  NUMBERS_TENTHS,
  NUMBERS_THOUSANDS,
  PLURAL_TO_SINGULAR_PAIRS,
  ROMAN_NUMERALS,
  SINGULAR_TO_PLURAL_PAIRS,
  TENTHS,
  UNCOUNTABLE_WORDS,
} from './data.constants';
import { fromByteArray, toByteArray } from 'base64-js';

export function valueIsEither_(value: string, values: string[] | string): boolean {
  if (!value) return false;
  if (!Array.isArray(values)) values = [values];
  return !!values.find((v) => v.toLowerCase() === value.toLowerCase());
}

export function valueEndsWith(value: string, values: any[] | string): boolean {
  if (!value) return false;
  if (!Array.isArray(values)) values = [values];
  return !!values.find((v) => value.endsWith(v));
}

export function valueEndsWith_(value: string, values: string[] | string): boolean {
  if (!value) return false;
  if (!Array.isArray(values)) values = [values];
  return !!values.find((v) => value.toLowerCase().endsWith(v.toLocaleLowerCase()));
}

export function capitalizeFirstLetter(s: string): string {
  return !s ? '' : s?.charAt(0).toUpperCase() + s?.slice(1);
}

export function replaceWords(str: string, find: string, replace = '') {
  if (!str || typeof str !== 'string' || !find) return str;
  if (Array.isArray(find)) find.forEach((s) => (str = str.replace(new RegExp(s, 'g'), replace)));
  else str = str?.replace(new RegExp(find, 'g'), replace);
  return str;
}

export function toTitleCase(str: string | any) {
  if (!str) return undefined;

  const canCapitalize = (s: string) => {
    return !LOWERS.map((l: string) => l.toLowerCase()).includes(s.toLowerCase());
  };

  return str
    .toLowerCase()
    .split(' ')
    .map((w: string, i: number) =>
      i === 0 || canCapitalize(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w,
    )
    .join(' ');
}

export function valueIncludes(value: string, values: string[] | string): boolean {
  let includes = false;

  if (!value || typeof value !== 'string' || !values) return false;
  if (!Array.isArray(values)) values = [values];

  values?.forEach((v: string) => {
    const includes_ = value?.toString()?.toLowerCase()?.includes(v?.toString()?.toLowerCase());
    return (includes = includes || includes_);
  });

  return includes;
}

export function valueIncludesAll(value: string, values: string[]): boolean {
  let includes = true;
  if (!value || !values?.length) return false;
  if (Array.isArray(value)) value = value.toString();
  values?.forEach((v) => (includes = includes && value?.toLowerCase()?.includes(v?.toLowerCase())));
  return includes;
}

export function valueIsEither(value: any, values: any[] | string): boolean {
  if (!value && value !== false && value !== 0) return false;
  if (!Array.isArray(values)) values = [values];
  return values.findIndex((v) => v === value) > -1;
}

export function camelToSpaced(y: string) {
  if (typeof y !== 'string' || y.includes(' ')) return y;
  return capitalizeFirstLetter(y.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, '$1'));
}

export function generateUniqueId() {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `${timestamp}-${randomPart}`;
}

export function isHexCode(value: string) {
  // Hex color code pattern: optional # followed by 3 or 6 hexadecimal characters
  // const hexColorRegex = /^#?([0-9a-fA-F]{3}){1,2}$/;
  const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
  return hexColorRegex.test(value);
}

export function toUnderscore(text: string) {
  // Convert camelCase to underscored text
  text = text.replace(/([a-z])([A-Z])/g, '$1_$2');
  // Convert multiple spaces to single underscore
  text = text.replace(/\s+/g, '_');
  // Convert to lowercase
  return text.toLowerCase();
}

export function arrayToString(array: string[], sep = ' '): string {
  if (!Array.isArray(array)) return array;
  return replaceWords(array.toString(), ',', sep);
}

export function stringAfter(str: string, char: string) {
  const index = str.indexOf(char);
  if (index !== -1) return str.substring(index + 1); // Or str.slice(index + 1);
  return undefined;
}

export function stringBefore(str: string, char: string) {
  const index = str.indexOf(char);
  if (index !== -1) return str.substring(0, index - 1); // Or str.slice(index + 1);
  return undefined;
}

export function stringAfterLast(str: string, pattern: RegExp | string, inclusive = false) {
  //  const pattern = /fields\.\d\.+/;
  const matches = str.match(new RegExp(pattern, 'g'));
  if (!matches || matches.length === 0) return undefined;
  const lastIndex = str.lastIndexOf(matches[matches.length - 1]);
  const ptLen = inclusive ? 0 : matches[matches.length - 1].length;
  const result = str.substring(lastIndex + ptLen);
  return result;
}

export function stringBeforeLast(str: string, pattern: RegExp | string, inclusive = false) {
  // const pattern = /fields\.\d+/;
  const matches = str.match(new RegExp(pattern, 'g'));
  if (!matches || matches.length === 0) return undefined;
  const lastIndex = str.lastIndexOf(matches[matches.length - 1]);
  const ptLen = inclusive ? matches[matches.length - 1].length : 0;
  const result = str.substring(0, lastIndex + ptLen);
  return result;
}

export function strBetween(str: string, substr1: string, substr2: string, fromSubstr?: string) {
  if (typeof str !== 'string') return str;
  const startIndex = fromSubstr ? str.indexOf(fromSubstr) : 0;
  if (startIndex === -1) return undefined;

  const index1 = str.indexOf(substr1, startIndex);
  const index2 = str.indexOf(substr2, index1);

  if (index1 === -1 || index2 === -1) return undefined;
  return str.substring(index1 + 1, index2)?.trim();
}

export function removeLast(str: string, subStr: string, replacement?: string) {
  const lastIndex = str.lastIndexOf(subStr);

  if (lastIndex !== -1) {
    const strStart = str.substring(0, lastIndex);
    const strEnd = str.substring(lastIndex + subStr.length);
    return `${strStart}${replacement ?? ''}${strEnd}`;
  }

  return str;
}

export function trimToLast(str: string, substr: string) {
  const lastIndex = str.lastIndexOf(substr);
  if (lastIndex !== -1) return str.substring(0, lastIndex);
  // Return the original string if the character is not found
  return str;
}

export function removeWords(str: string, substr: string[]) {
  const regex = new RegExp(substr.join('|'), 'gi');
  return str.replace(regex, '').trim();
}

export function isValidJSON(json: string) {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

export function readDotProperty(string: string) {
  let text = string.replace('.', '\'s ');
  text = text.replace('.', ' ');

  if (!text) return '';

  let i, j, str, lowers, uppers;
  str = text.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  lowers = LOWERS;

  for (i = 0, j = lowers.length; i < j; i++) {
    str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'), function (txt) {
      return txt.toLowerCase();
    });
  }

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++) {
    str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'), uppers[i].toUpperCase());
  }

  return str;
}

export function truncate(string: string, n = 120): string {
  if (typeof string !== 'string') return string;
  return string.length > n ? string.substring(0, n) + '...' : string;
}

export function stringToEnum(str: string) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, '_').toUpperCase();
}

export function endsWith(str: string, chars: string | string[]) {
  if (!Array.isArray(chars)) chars = [chars];
  const endWith = chars.reduce((a, b) => a || str.endsWith(b), false);
  return endWith;
}

/// phone /////// numbers ////
export function intToRoman(num: number, lowerCase = true) {
  let result = '';

  for (const { value, numeral } of ROMAN_NUMERALS) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }

  return lowerCase ? result?.toLowerCase() : result;
}

export function getLevenshteinDistance(a: string, b: string) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const mat = [];
  for (let i = 0; i <= b.length; i++) mat[i] = [i];
  for (let j = 0; j <= a.length; j++) mat[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) mat[i][j] = mat[i - 1][j - 1];
      else mat[i][j] = Math.min(mat[i - 1][j - 1] + 1, mat[i][j - 1] + 1, mat[i - 1][j] + 1);
    }
  }

  return mat[b.length][a.length];
}

export function numberToWord(value: number) {
  if (!value) '';
  const arr = (x: any): any => Array.from(x);
  const num = (x: number) => Number(x) || 0;
  const str = (x: number) => String(x);
  const isEmpty = (xs: any[]) => xs.length === 0;
  const take = (n: number) => (xs: any[]) => xs.slice(0, n);
  const drop = (n: number) => (xs: any[]) => xs.slice(n);
  const reverse = (xs: any[]) => xs.slice(0).reverse();
  const comp = (f: any) => (g: any) => (x: number) => f(g(x));
  const not = (x: number) => !x;

  const chunk =
    (n: number) =>
    (xs: any[]): any =>
      isEmpty(xs) ? [] : [take(n)(xs), ...chunk(n)(drop(n)(xs))];

  const a = NUMBERS_BASE;
  const b = NUMBERS_TENTHS;
  const g = NUMBERS_THOUSANDS;

  const numToWords = (n: number) => {
    // this part is really nasty still
    // it might edit this again later to show how Monoids could fix this up
    const makeGroup = ([ones, tens, huns]: any) => {
      return [
        num(huns) === 0 ? '' : a[huns] + ' hundred ',
        num(ones) === 0 ? b[tens] : (b[tens] && b[tens] + '-') || '',
        a[tens + ones] || a[ones],
      ].join('');
    };
    // "thousands" constructor; no real good names for this, i guess
    const thousand = (group: string, i: number) => (group === '' ? group : `${group} ${g[i]}`);
    // execute !
    if (typeof n === 'number') return numToWords((String(n) as any));

    if (n === '0') return 'zero';

    return comp(chunk(3))(reverse)(arr(n))
      .map(makeGroup)
      .map(thousand)
      .filter(comp(not)(isEmpty))
      .reverse()
      .join(' ');
  };

  const no = Number(value.toString().split('.')[0]);
  if (no) return numToWords(no);
  else return '';
}

export const randomNumbers = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min)) + min;
};

export function toSingular(word: string, amount?: number): string {
  if (typeof word !== 'string') return word;

  if (amount !== undefined && amount > 1) return toPlural(word);
  // save some time in the case that singular and plural are the same
  if (UNCOUNTABLE_WORDS.indexOf(word.toLowerCase()) >= 0) return word;

  // check for irregular forms
  for (const w in IRREGULAR_SINGULAR_PLURAL_PAIRS) {
    const pattern = new RegExp(`${IRREGULAR_SINGULAR_PLURAL_PAIRS[w]}$`, 'i');
    const replace = w;
    if (pattern.test(word)) return word.replace(pattern, replace);
  }

  // check for matches using regular expressions
  for (const reg in PLURAL_TO_SINGULAR_PAIRS) {
    const pattern = new RegExp(reg, 'i');
    if (pattern.test(word)) return word.replace(pattern, PLURAL_TO_SINGULAR_PAIRS[reg]);
  }
  return word;
}

export function toPlural(word: string, amount?: number): string {
  if (typeof word !== 'string') return word;

  if (amount !== undefined && amount === 1) return toSingular(word);
  // save some time in the case that singular and plural are the same
  if (UNCOUNTABLE_WORDS.indexOf(word.toLowerCase()) >= 0) return word;

  // check for irregular forms
  for (const w in IRREGULAR_SINGULAR_PLURAL_PAIRS) {
    const pattern = new RegExp(`${w}$`, 'i');
    const replace = IRREGULAR_SINGULAR_PLURAL_PAIRS[w];
    if (pattern.test(word)) return word.replace(pattern, replace);
  }

  // check for matches using regular expressions
  for (const reg in SINGULAR_TO_PLURAL_PAIRS) {
    const pattern = new RegExp(reg, 'i');
    if (pattern.test(word)) return word.replace(pattern, SINGULAR_TO_PLURAL_PAIRS[reg]);
  }
  return word;
}

export function isValidTanzaniaPhone(number: string): boolean {
  // This<<?(255)>> starting with +255 or 255
  const regex = new RegExp('^\\+?(255|0)(6|7)(\\d{8})$');
  return regex.test(number) && number.length == 12;
}

export function removeLeadingPhoneCode(phone: string) {
  const str = phone?.toString();
  if (!(str?.length > 0) || !phone) return phone;
  if (str.indexOf('0') === 0) return str?.substring(1, str.length - 1);
  if (str.indexOf('+255') === 0) return str?.replace('+255', '');
  if (str.indexOf('255') === 0) return str?.replace('255', '');
  return str;
}

export function moneyFormat(data: string) {
  if (!data) return '';
  const [num, dec] = `${data}`.split('.');
  const val = [];
  let proc = 0;
  while (num.length - proc > 3) {
    val.unshift(num.substring(num.length - proc - 3, num.length - proc));
    proc += 3;
  }
  val.unshift(num.substring(0, num.length - proc));
  return val.join(',') + (dec ? '.' + dec : '');
}

export function numberTowords(n: number): string {
  if (n < 20) return FIRST_20_NUMBERS_IN_WORDS[n];
  const digit = n % 10;

  let prefix = TENTHS[~~(n / 10) - 2];
  if (n < 100) return prefix + (digit ? '-' + FIRST_20_NUMBERS_IN_WORDS[digit] : ' ');

  prefix = FIRST_20_NUMBERS_IN_WORDS[~~(n / 100)] + ' hundred';
  if (n < 1000) return prefix + (n % 100 == 0 ? ' ' : ' and ' + numberTowords(n % 100));

  prefix = numberTowords(~~(n / 1000)) + ' thousand';
  return prefix + (n % 1000 != 0 ? ' ' + numberTowords(n % 1000) : '');
}

export function isNumberOfLength(val: string, n: number, m: number) {
  const isnum = /^\d+$/.test(val);
  if (val.length >= n && val.length <= m && isnum) return true;
  return false;
}

export function arrayToDisplayString(array: string[], lastSep = 'and'): string {
  if (!Array.isArray(array) || !array?.length) return '';
  let s = array.map((s) => ' ' + s).toString();
  if (array.length === 1) lastSep = '';
  s = `${s.substring(0, s.lastIndexOf(','))} ${lastSep} ${s.substring(s.lastIndexOf(',') + 1)}`;
  return s?.trim() ?? '';
}

export const roundToNearest = (n: number, x: number): number => (n ? Math.ceil(n / x) * x : 0);

export function slugify(input: string): string {
  if (!input) return '';

  return input
    .toString()
    .normalize('NFD') // Split accented chars
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumerics with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}

export function capitalize(text: string): string {
  return text.substring(0, 1).toUpperCase() + text.substring(1, text.length).toLowerCase();
}

export function currentTimestamp(): number {
  return Math.ceil(new Date().getTime() / 1000);
}

export function timeLeft(expiredAt: number): number {
  return Math.max(0, expiredAt - currentTimestamp());
}

export class Base64 {
  static encode(plainText: string): string {
    return fromByteArray(pack(plainText)).replace(/[+/=]/g, (m) => {
      return { '+': '-', '/': '_', '=': '' }[m] as string;
    });
  }

  static decode(b64: string): string {
    b64 = b64.replace(/[-_]/g, (m) => {
      return { '-': '+', '_': '/' }[m] as string;
    });
    while (b64.length % 4) {
      b64 += '=';
    }

    return unpack(toByteArray(b64));
  }
}

export function pack(str: string) {
  const bytes: any = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(...[str.charCodeAt(i)]);
  }

  return bytes;
}

export function unpack(byteArray: any) {
  return String.fromCharCode(...byteArray);
}

export const base64 = { encode: Base64.encode, decode: Base64.decode };

export function replaceLast(str: string, searchValue: any, replaceValue: string) {
  let res = str;

  if (!Array.isArray(searchValue)) searchValue = [searchValue];

  searchValue.forEach((s: any) => {
    const lastIndex = res.lastIndexOf(s);
    if (lastIndex === -1) return;

    // Replace the last occurrence
    res =
      res.substring(0, lastIndex) + // Part before the last occurrence
      replaceValue + // The replacement value
      res.substring(lastIndex + s.length); // Part after the last occurrence
  });

  return res;
}
