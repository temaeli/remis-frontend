import { IconsViewerComponent } from '@shared/components/icon/icons-viewer.component';
import { SYSTEM_SHORTCUTS } from './app-shortcuts';
import { DetailsComponent } from '@shared/components/details/details.component';
import { DetailsParameter } from '@shared/components/details/details.interface';
import { SettingsService } from './settings.service';
import { inHtml } from '@shared/components/view-component/view.helpers';

export const viewIcons = (st: SettingsService) => {
  st.vs.openModal(IconsViewerComponent, null, '90%');
};

export const toggleDarkMode = (st: SettingsService) => {
  st.setSettings({ theme: st.settings$.value.theme === 'dark' ? 'light' : 'dark' });
};

export const showShortCuts = (st: SettingsService) => {
  let shortcutsByType = [];
  const keys = Object.keys(SYSTEM_SHORTCUTS);
  const shortcuts = Object.values(SYSTEM_SHORTCUTS).map((s, i) => ({ ...s, key: keys[i] }));

  const allTypes = [...new Set(shortcuts.map((v) => v.type))];

  const keyClass = `text-primary size-[35px] flex justify-center items-center bg-primary/20 rounded-full border-3 `;

  const typeShortcuts_ = (type: any) => {
    return shortcuts
      .filter((s) => s.type === type)
      .map((s) => `${inHtml(s.key, keyClass)} ${inHtml('=>', 'very-faded px-3')}  ${s.name}`);
  };

  shortcutsByType = allTypes.map((type) => ({ name: type, shortcuts: typeShortcuts_(type) }));

  const data: Partial<DetailsParameter> = {
    entity: { shortcutsByType },
    title: 'Shortcuts',
    expandLists: true,
    showArraysHeaders: false,
    stringArrayIndexClass: 'ps-2 faded', // avoid stylized index listing the
  };

  return st.vs.openModal(DetailsComponent, data, '70%');
};
