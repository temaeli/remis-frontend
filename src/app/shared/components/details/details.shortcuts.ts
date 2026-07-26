import { DetailsComponent } from './details.component';
import * as fromAllDetails from './details.shortcuts';
import { Subject, Subscription, filter } from 'rxjs';
import { camelToSpaced } from './util/util.helpers';
import { FieldLayout } from './details.interface';

export const KEY_BOARD_EVENT$ = new Subject<KeyboardEvent>();

export type ShortcutType =
  | 'dynamic-field'
  | 'all-details'
  | 'data-table-hybrid'
  | 'app'
  | 'main-layout'
  | 'portal-auth-layout';

export interface SystemShortcut {
  type: ShortcutType;
  name?: string;
  callback?: (comp: any) => any;
}

export type ADC = DetailsComponent;

export const setListLayout = (a: ADC) => setLayout('list', a);
export const setInlineListLayout = (a: ADC) => setLayout('inline-list', a);
export const setPalletesLayout = (a: ADC) => setLayout('palletes', a);
export const setTableLayout = (a: ADC) => setLayout('table', a);
export const toggleExpandLists = (a: ADC) => (a.expandLists = !a.expandLists);

function setLayout(layout: FieldLayout, a: DetailsComponent) {
  if (!(a instanceof DetailsComponent)) return;
  a.layout = layout;
  a.overide = true;
  a.ngOnInit();
  return layout;
}

export const listenToShortcuts = (type: ShortcutType, comp: any): Subscription => {
  const filterTypeEvents = (e: KeyboardEvent) => {
    const typeKeys = Object.keys(SYSTEM_SHORTCUTS).filter((k) => SYSTEM_SHORTCUTS[k].type === type);
    return typeKeys.includes(e.key);
  };

  return KEY_BOARD_EVENT$.pipe(filter(filterTypeEvents)).subscribe((e) =>
    SYSTEM_SHORTCUTS[e.key]?.callback?.(comp),
  );
};

// alias common props
const ad: ShortcutType = 'all-details';

const shortcut_ = (type: ShortcutType, n: string, callback?: (c: any) => any): SystemShortcut => {
  const name = camelToSpaced(n);
  return { type, name, callback };
};

export const SYSTEM_SHORTCUTS: Record<string, SystemShortcut> = {
  // all details shortcuts
  1: shortcut_(ad, 'setListLayout', fromAllDetails.setListLayout),
  2: shortcut_(ad, 'setInlineListLayout', fromAllDetails.setInlineListLayout),
  3: shortcut_(ad, 'setTableLayout', fromAllDetails.setTableLayout),
  4: shortcut_(ad, 'setPalletesLayout', fromAllDetails.setPalletesLayout),
  6: shortcut_(ad, 'toggleExpandLists', fromAllDetails.toggleExpandLists),
};
