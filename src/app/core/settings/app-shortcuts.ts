import { camelToSpaced } from '@core/helpers';
import * as fromSettings from './settings-shortcuts';

import { Subject, Subscription, filter } from 'rxjs';

export const KEY_BOARD_EVENT$ = new Subject<KeyboardEvent>();

export type ShortcutTarget = 'form' | 'details' | 'data-grid' | 'settings' | 'layout';
export interface SystemShortcut {
  type: ShortcutTarget;
  name?: string;
  callback?: (comp: any) => any;
}

export const listenToShortcuts = (type: ShortcutTarget, comp: any): Subscription => {
  const filterTypeEvents = (e: KeyboardEvent) => {
    const typeKeys = Object.keys(SYSTEM_SHORTCUTS).filter((k) => SYSTEM_SHORTCUTS[k].type === type);
    return typeKeys.includes(e.key);
  };

  return KEY_BOARD_EVENT$.pipe(filter(filterTypeEvents)).subscribe((e) =>
    SYSTEM_SHORTCUTS[e.key]?.callback?.(comp),
  );
};

const shortcut_ = (type: ShortcutTarget, name: any, callback?: (c: any) => any): SystemShortcut => {
  name = camelToSpaced(name);
  return { type, name, callback };
};

export const SYSTEM_SHORTCUTS: Record<string, SystemShortcut> = {
  d: shortcut_('settings', 'toggleDarkMode', fromSettings.toggleDarkMode),
  i: shortcut_('settings', 'viewIcons', fromSettings.viewIcons),
  8: shortcut_('settings', 'showShortCuts', fromSettings.showShortCuts),
};
