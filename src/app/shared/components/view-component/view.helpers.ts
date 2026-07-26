import { ContentParameter, HasChildren } from '@shared/components/view-component/view-interface';
import { RGB_COLORS } from '../details/util/color/color.constants';
import { getNameField } from '../details/util/field/fields.helper';
import { ActionButton } from '../action-buttons/action-buttons.inteface';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { getLevenshteinDistance, toTitleCase } from '@core/helpers';
import { ActionMapper } from '@shared/services/view.service';
import { Menu } from '@core';

export function getColorName(hexColor: string) {
  // Remove the "#" symbol if it's included in the input
  hexColor = hexColor.replace('#', '');

  // Convert the hex color code to RGB format
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);

  let colorName = null;
  let distance = Number.POSITIVE_INFINITY;

  // Find the closest color name in the library
  for (const color in RGB_COLORS) {
    const [r_, g_, b_] = (RGB_COLORS as any)[color];
    const d = Math.sqrt((r - r_) ** 2 + (g - g_) ** 2 + (b - b_) ** 2);
    if (d < distance && (distance = d)) colorName = color;
  }

  return colorName;
}

export function getColorCode(name: string, format = 'hex') {
  if (typeof name !== 'string') return '';
  // variables to store the closest color and its distance
  let colorCode = null;
  let distance = Number.POSITIVE_INFINITY;

  // Assign color as according to the closest Levenshtein distance
  for (const color in RGB_COLORS) {
    const d = getLevenshteinDistance(name.toLowerCase(), color.toLowerCase());
    if (d < distance && (distance = d)) colorCode = rgbToHex((RGB_COLORS as any)[color]);
  }

  return colorCode;
}

export function rgbToHex([r, g, b]: number[]) {
  // Ensure that the values are within the valid range (0-255)
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  // Convert each component to its hexadecimal representation
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  // Combine the hexadecimal values
  return `#${hexR}${hexG}${hexB}`;
}

export function fmtSpecialCharsToHtml(text: string) {
  return text.replace(/\n/g, '<br>');
}

export function hexToRgb(hexColor: string) {
  if (typeof hexColor !== 'string') return hexColor;
  // Remove the hash if present
  hexColor = hexColor.replace(/^#/, '');

  // Convert hex to RGB
  const bigint = parseInt(hexColor, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function getContrastGray(hexColor: string) {
  if (typeof hexColor !== 'string') return '#000000';
  // Calculate luminance
  const calculateLuminance = (rgb: any) => {
    const [r, g, b] = rgb.map((value: any) => {
      value /= 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Get RGB from hex // Calculate luminance
  const rgb = hexToRgb(hexColor);
  const luminance = calculateLuminance(rgb);
  // Decide on the contrasting color
  const contrastColor = luminance > 0.5 ? '#000000' : '#ffffff';
  return contrastColor;
}

export function getContrastColor(hexColor: string) {
  // Remove the hash if present
  const cleanHex: any = hexColor.replace(/^#/, '');

  // Invert each channel and convert back to hex
  const invertedColor = cleanHex
    .match(/.{1,2}/g) // Split into pairs
    .map((channel: any) => {
      const invertedValue = 255 - parseInt(channel, 16);
      return invertedValue.toString(16).padStart(2, '0'); // Convert back to hex
    })
    .join('');

  return `#${invertedColor}`;
}

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

export function getName(str: string) {
  // Find the index of "as" followed by a space
  const start = str.search(/as\s/);
  if (start === -1) return str.split(' ')[0]?.trim();

  // Find the index of the first space followed by "("
  const end = str.search(/\w+\s?\(/);
  if (end === -1) return str.split(' as ')[1]?.trim();
  // Extract the substring between start and end
  return str.slice(start + 3, end);
}

export function findParentWithClass(element: Element, className: string): Element | undefined {
  let parent = element.parentElement;

  while (parent) {
    if (parent.classList.contains(className)) return parent;
    parent = parent.parentElement;
  }

  return undefined; // Return null if no matching parent is found
}

export function onKeyDown(event: KeyboardEvent, mapper: ActionMapper<any> | any, context: any) {
  if (!mapper?.[event.key]) return;
  mapper[event.key](context);
}

export function isValidHex(str: string) {
  return /^[0-9a-fA-F]+$/.test(str);
}

export function getLastIdFromUrl(url: string) {
  const arr = url.split('/').reverse();
  return arr.find((p) => isValidHex((p.split('-').pop() as any)));
}

export function getUpsertBtnProps(entityName?: string, idKey = 'uid') {
  return {
    iconMapper: (d?: any) => (!d?.[idKey] ? 'add' : 'edit'),
    labelMapper: (d?: any) => `${!d?.[idKey] ? 'Add' : 'Edit'} ${entityName ?? ''}`,
    classMapper: (d?: any) => (!d?.[idKey] ? 'btn-add-primary' : 'btn-edit-secondary'),
  } as ActionButton;
}

export function getDeleteMsg(data: any, labelKey?: string, deletedKey = 'deleted'): string {
  let label = undefined;
  if (labelKey) label = data?.[labelKey];
  else label = getNameField(data)?.value;

  const color = data?.[deletedKey] ? 'primary' : 'danger';
  const action = data?.[deletedKey] ? 'restore' : 'delete';
  return `Are you sure you want to ${action} <b class='text-${color}'>${label ?? ''}</b> ?`;
}

export function getDeleteBtnProps(
  entityName?: string,
  labelKey?: string,
  deletedKey = 'deleted',
): Partial<ActionButton> {
  return {
    iconMapper: (d: any) => `${d?.[deletedKey] ? 'refresh' : 'delete'}`,
    labelMapper: (d: any) => `${d?.[deletedKey] ? 'Restore' : 'Delete'}  ${entityName}`,
    classMapper: (d: any) => (d?.[deletedKey] ? '' : 'text-danger'),

    confirmDataMapper: (d: any) => ({
      title: `${d?.[deletedKey] ? 'RESTORE' : 'DELETE'}`,
      confirmButtonColor: `${d?.[deletedKey] ? 'primary' : 'red'}`,
      confirmText: `${d?.[deletedKey] ? 'RESTORE' : 'DELETE'}`,
      message: getDeleteMsg(d, labelKey, deletedKey),
    }),
  };
}

export function navigateRelativeTo(
  base: { router: Router; route: ActivatedRoute },
  parentSlug: string,
  segments?: string | string[],
) {
  const pathArr = segments ? (Array.isArray(segments) ? segments : [segments]) : [];
  if (!base.router.url.endsWith(parentSlug)) pathArr.splice(0, 0, parentSlug);
  base.router.navigate(pathArr, { relativeTo: base.route });
}

export function getContentSlugTree(slug: string, contentList: ContentParameter[]): string[] {
  // Build a map for faster lookups
  const slugMap = new Map<string, { item: ContentParameter; parent: string | null }>();

  function buildSlugMap(items: ContentParameter[], parentSlug: string | null = null) {
    items.forEach((item) => {
      if (!item.slug) return;
      slugMap.set(item.slug, { item, parent: parentSlug });
      if (item.children) buildSlugMap(item.children, item.slug);
    });
  }

  buildSlugMap(contentList); // Build the map

  // Build path from target to root
  const path: string[] = [];
  let currentSlug: string | null = slug;

  while (currentSlug) {
    const entry = slugMap.get(currentSlug);
    if (!entry) break;
    path.unshift(currentSlug);
    currentSlug = entry.parent;
  }

  return path;
}

/**
 * Returns the complete ContentParameter objects from root to target slug
 * @param slug - The target slug to find the path to
 * @param contentList - List of ContentParameter objects to search through
 * @returns Array of ContentParameter objects representing the path from root to target
 */
export function getContentTree(slug: string, contentList: ContentParameter[]): ContentParameter[] {
  // Build a map for faster lookups
  const slugMap = new Map<string, { item: ContentParameter; parent: string | null }>();

  function buildSlugMap(items: ContentParameter[], parentSlug: string | null = null) {
    items.forEach((item) => {
      if (!item.slug) return;
      slugMap.set(item.slug, { item, parent: parentSlug });
      if (item.children) buildSlugMap(item.children, item.slug);
    });
  }

  buildSlugMap(contentList); // Build the map

  // Build path from target to root
  const path: ContentParameter[] = [];
  let currentSlug: string | null = slug;

  while (currentSlug) {
    const entry = slugMap.get(currentSlug);
    if (!entry) break;
    path.unshift(entry.item);
    currentSlug = entry.parent;
  }

  return path;
}

/**
 * Recursively adds properties to objects and their children using a callback function
 * @param items - Array of objects to process
 * @param mapperCallback - Function that takes an item and returns properties to add
 * @returns New array with added properties
 */
export function addPropertiesRecursively<T extends HasChildren, R extends Record<string, any>>(
  items: T[],
  mapperCallback: (item: T) => R,
): (T & R)[] {
  return items.map((item) => {
    // Get additional properties from callback
    const additionalProperties = mapperCallback(item);

    // Create new item with additional properties
    const newItem: T & R = { ...item, ...additionalProperties };

    // Recursively process children if they exist
    if (item.children && Array.isArray(item.children)) {
      newItem.children = addPropertiesRecursively(item.children, mapperCallback);
    }

    return newItem;
  });
}

/**
 * Recursively extracts permissions from buttons and nested buttons
 * @param {Array} buttons - Array of button objects
 * @returns {Set} Set of unique permissions
 */
export function extractButtonPermissions(buttons: ActionButton[]) {
  const permissions = new Set();

  if (!Array.isArray(buttons)) return permissions;

  for (const button of buttons) {
    // Add permissions from current button
    if (Array.isArray(button.permissions)) {
      button.permissions.forEach((perm) => permissions.add(perm));
    }

    // Recursively extract permissions from nested buttons
    if (Array.isArray(button.buttons)) {
      const nestedPermissions = extractButtonPermissions(button.buttons);
      nestedPermissions.forEach((perm) => permissions.add(perm));
    }
  }

  return permissions;
}

/**
 * Recursively collects all permissions from an item and its children
 * @param {Object} item - The item object
 * @returns {Set} Set of unique permissions from this item and all descendants
 */
export function collectAllPermissions(item: any): Set<any> {
  const allPermissions = new Set();

  // Add item's direct permissions
  if (Array.isArray(item.permissions)) {
    item.permissions.forEach((p: string) => allPermissions.add(p));
  }

  // Extract permissions from actionButtons
  if (Array.isArray(item.actionButtons)) {
    const actionPerms = extractButtonPermissions(item.actionButtons);
    actionPerms.forEach((perm) => allPermissions.add(perm));
  }

  // Extract permissions from headerButtons
  if (Array.isArray(item.headerButtons)) {
    const headerPerms = extractButtonPermissions(item.headerButtons);
    headerPerms.forEach((perm) => allPermissions.add(perm));
  }

  // Recursively collect permissions from children
  if (Array.isArray(item.children)) {
    for (const child of item.children) {
      const childPermissions = collectAllPermissions(child);
      childPermissions.forEach((perm) => allPermissions.add(perm));
    }
  }

  return allPermissions;
}

/**
 * Aggregates permissions from nested children and buttons into each item's permissions property
 * @param {Array} items - Array of item objects
 * @returns {Array} Updated array with aggregated permissions
 */
export function aggregatePermissions(items: any[]): any[] {
  if (!Array.isArray(items)) return items;

  return items.map((item) => {
    // Create a copy of the item to avoid mutation
    const updatedItem = { ...item };

    // Collect all permissions from this item and its descendants
    const allPermissions = collectAllPermissions(item);

    // Update the permissions property with unique values
    updatedItem.permissions = Array.from(allPermissions);

    // Recursively process children if they exist
    if (Array.isArray(item.children)) updatedItem.children = aggregatePermissions(item.children);

    return updatedItem;
  });
}

export function findSidebarMatch(items: Menu[], currentRoute: string): Menu | null {
  let exactMatch: Menu | null = null;
  let closestMatch: Menu | null = null;
  let longestMatchLength = -1;

  const normalize = (route: string) => route.replace(/\/+$/, ''); // remove trailing slash

  const normalizedCurrent = normalize(currentRoute);

  const traverse = (list: Menu[]) => {
    for (const item of list) {
      if (item.route) {
        const normalizedRoute = normalize(item.route);

        // ✅ Exact match
        if (normalizedRoute === normalizedCurrent) {
          exactMatch = item;
          return;
        }

        // ✅ Closest (prefix) match
        if (
          normalizedCurrent.startsWith(normalizedRoute) &&
          normalizedRoute.length > longestMatchLength
        ) {
          longestMatchLength = normalizedRoute.length;
          closestMatch = item;
        }
      }

      if (item.children?.length) traverse((item as any).children);
      // Stop early if exact match found
      if (exactMatch) return;
    }
  };

  traverse(items);

  return exactMatch ?? closestMatch;
}

export function inHtml(text: string, className?: string, tag?: string): string {
  if (!tag) tag = 'span';
  const openingTag = className ? `<${tag} class="${className}">` : `<${tag}>`;
  const closingTag = `</${tag}>`;
  return `${openingTag}${text}${closingTag}`;
}

export function nodeFromString(str = '') {
  // Create a temporary div element
  const tempDiv = document.createElement('div');

  // Set the innerHTML with the   string
  tempDiv.innerHTML = str;

  // Get the first child (string element)
  const elNode = tempDiv.firstElementChild ?? document.createTextNode(str);

  // Clone the node to remove it from the temporary container
  return elNode?.cloneNode(true);
}

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Add this helper method to your component
export function addOpacity(color: string, opacity: number): string {
  // If color is already rgba, replace the alpha
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }

  // If color is rgb, convert to rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }

  // If color is hex, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback: wrap in rgba with opacity (works for named colors)
  return `rgba(${color}, ${opacity})`;
}

//**/slug/:uid //
export function matchRoute(url: UrlSegment[], slug: string, param = 'uid') {
  const matches = url.length >= 2 && url[url.length - 2].path === slug;
  // console.log('matcher', { url, slug, matches });
  if (matches) return { consumed: url, posParams: { [param]: url[url.length - 1] } };
  return null;
}

// 2026-02-19T10:30:00+05:30 //dateStringToOffsetTime
export const toOffsetTime = (value: any) => (value ? `${value}T00:00+03:00` : value);
