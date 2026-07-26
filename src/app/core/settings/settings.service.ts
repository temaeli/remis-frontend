import { HttpClient } from '@angular/common/http';
import { DOCUMENT, inject, Injectable, OnDestroy, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
import { listenToShortcuts } from './app-shortcuts';
import { LocalStorageService } from './local-storage.service';
import { NotificationService } from '@shared/services/notification.service';
import { ViewService } from '@shared/services/view.service';
import { ActionButton } from '@shared/components/action-buttons/action-buttons.inteface';
import { mergeObjects } from '@core/helpers';
import { AppDirectionality } from '@shared';
import { Language, TranslateService } from '@ngx-translate/core';
import { Direction } from '@angular/cdk/bidi';
import { AppSettings } from './settings';
import { defSettings, settings$, Theme } from './settings.store';

@Injectable({
  providedIn: 'root',
})
export class SettingsService implements OnDestroy {
  private readonly storage = inject(LocalStorageService);
  private readonly mediaMatcher = inject(MediaMatcher);
  private readonly document = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);
  private readonly dir = inject(AppDirectionality);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  vs = inject(ViewService);
  http = inject(HttpClient);
  notify = inject(NotificationService);

  private readonly key = 'app-settings';
  private readonly darkModeClass = 'dark';

  settings$!: BehaviorSubject<AppSettings>;
  actionButtons: ActionButton[] = [];

  private readonly subs = new Subscription();
  readonly htmlElement = this.document.querySelector('html')!;

  languages = ['en-US', 'sw-TZ'];

  constructor() {
    this.loadSettings();
    this.setButtons();
    this.subs.add(listenToShortcuts('settings', this));
  }

  loadSettings() {
    const settings: AppSettings = mergeObjects(defSettings, { ...this.storage.getItem(this.key) }) as any;

    // Check whether the browser support `prefers-color-scheme`
    const noPref = this.mediaMatcher.matchMedia('(prefers-color-scheme)').media !== 'not all';

    // Set theme to dark if `prefers-color-scheme` is dark. Otherwise, set it to light.
    if (settings.theme === 'auto' && noPref) {
      const isSystemDark = this.mediaMatcher.matchMedia('(prefers-color-scheme: dark)').matches;
      settings.theme = isSystemDark ? 'dark' : 'light';
    }
    //
    this.settings$ = new BehaviorSubject(settings);
    this.setSettings(settings);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setSettings(settings_: Partial<AppSettings>) {
    const settings = mergeObjects(this.settings$?.getValue() ?? {}, settings_) as any;
    this.storage.setItem(this.key, settings);
    this.settings$.next(settings);
    settings$.next(settings);

    //toggle if them was set
    if (settings_.theme) this.setTheme(settings_.theme);
  }

  private setTheme(theme: Theme) {
    const setTheme_ = () => {
      //remove first then add if
      this.renderer.removeClass(this.htmlElement, this.darkModeClass);
      this.htmlElement.dataset['theme'] = theme;
      if (theme == 'dark') this.renderer.addClass(this.htmlElement, this.darkModeClass);
    };

    setTheme_();
    // these below are buggy on the  collapse sidebar
    // // @ts-ignore
    // if (!this.document.startViewTransition) setTheme_();
    // // @ts-ignore
    // this.document.startViewTransition(() => setTheme_());
  }

  getCssVariable(variable: string) {
    const docStyle = getComputedStyle(this.htmlElement);
    const colorValue = docStyle.getPropertyValue(variable);
    return colorValue;
  }

  reset() {
    this.storage.remove(this.key);
  }

  setDirection(dir?: Direction) {
    if (!dir) return;
    this.setSettings({ dir });
    if (!this.settings$.value.dir) return;
    this.dir.value = this.htmlElement.dir = this.settings$.value.dir;
  }

  getTranslateLang() {
    if (this.settings$.value.language === 'auto') {
      const browserLang = navigator.language;
      return this.languages.includes(browserLang) ? browserLang : 'en-US';
    }
    return this.settings$.value.language ?? 'en-US';
  }

  setLanguage(language?: Language) {
    if (language) this.setSettings({ language });
    const lang = this.getTranslateLang();
    if (lang) this.translate.use(lang);
  }

  setButtons() {
    this.actionButtons = [
      {
        type: 'icon',
        class: 'text-secondary',
        iconMapper: () => (this.settings$.value.theme === 'dark' ? 'bulb_off' : 'bulb'),
        click: () => {
          this.setSettings({ theme: this.settings$.value.theme === 'dark' ? 'light' : 'dark' });
        },
      },
    ];
  }
}
