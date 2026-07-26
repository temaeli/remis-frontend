import { Injectable, inject } from '@angular/core';
import { SettingsService } from '@core/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslateLangService {
  private readonly translate = inject(TranslateService);
  private readonly settings = inject(SettingsService);

  load() {
    return new Promise<void>((resolve) => {
      const defaultLang = this.settings.getTranslateLang() ?? 'en-US';

      this.translate.setFallbackLang(defaultLang);
      this.translate.use(defaultLang).subscribe({
        next: () => console.log(`Successfully initialized '${defaultLang}' language.'`),
        error: (error) => {
          console.error(`Problem with '${defaultLang}' language initialization.'`, error);
          resolve();
        },
        complete: () => resolve(),
      });
    });
  }
}
