import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SettingsService } from '@core/settings/settings.service';
import { Language, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-translate',
  template: `
    <button matIconButton [matMenuTriggerFor]="menu">
      <mat-icon svgIcon="language" />
    </button>

    <mat-menu #menu="matMenu">
      @for (lang of langs; track lang.value) {
        <button mat-menu-item (click)="changeLang(lang.value)">
          <span class="d-flex justify-content-between gap-8">
            {{ lang.name | translate }}

            @if (lang.value === options.language) {
              <mat-pseudo-checkbox state="checked" appearance="minimal" />
            }
          </span>
        </button>
      }
    </mat-menu>
  `,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatPseudoCheckbox, TranslatePipe],
})
export class TranslateButton {
  private st = inject(SettingsService);

  options = this.st.settings$.value;

  langs: { value: Language; name: string }[] = [
    { value: 'en-US', name: 'en_us' },
    { value: 'sw-TZ', name: 'sw_tz' },
    { value: 'auto', name: 'system' },
  ];

  changeLang(lang: Language) {
    this.st.setSettings({ language: lang });
  }
}
