import { toTitleCase } from './string.helpers';

export function getDisplayName(str: string) {
  if (typeof str !== 'string') return undefined;
  str = str.replace(/_/g, ' '); // Replace underscores with spaces
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2'); // Transform camel case to space-separated words
  str = str.toLowerCase(); // Convert to lowercase

  // Convert to title case
  let strArray = str.split(' ');
  strArray = strArray.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  str = toTitleCase(str);

  return str;
}

let timer: any = undefined;

export function delayedExecution(callback: (data?: any) => any, time: number, clearOlder = false) {
  if (clearOlder) clearTimeout(timer);
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => resolve(callback()), time);
  });
}
