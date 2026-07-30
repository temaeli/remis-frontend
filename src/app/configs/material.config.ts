import { 
  EnvironmentProviders, 
  inject, 
  makeEnvironmentProviders, 
  provideAppInitializer 
} from '@angular/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_CARD_CONFIG, MatCardConfig } from '@angular/material/card';
import { MatDateFormats } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgIcons } from '@shared/components/icon/svg-icons.constants';
import { SVG_ICONS } from '@shared/components/icon/tag-icons.constants';

/**
 * Global configuration for Angular Material Cards (`MatCard`).
 * Enforces outlined appearance across all mat-card components in the application.
 */
export const CUSTOM_CARD_CONFIG: MatCardConfig = {
  appearance: 'outlined',
};

/**
 * Custom date & time formats configuration for Angular Material components (`MatDatepicker`, `MatTimepicker`).
 * 
 * Configures ISO-like parsing rules and standardized display formatting:
 * - **Date Input**: ISO format (`yyyy-MM-dd`)
 * - **Time Input**: 24-hour format (`HH:mm`)
 * - **Month/Year Label**: Year and abbreviated month (`yyyy MMM`)
 * - **Accessibility Labels**: Standalone month (`LL`) and year/month (`yyyy MMM`)
 */
export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'yyyy-MM-dd',
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    timeInput: 'HH:mm',
    monthYearLabel: 'yyyy MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'yyyy MMM',
  },
};

/**
 * Pre-populates the Angular Material `MatIconRegistry` during application startup.
 * 
 * Registers both external SVG files (from the static `/images/svg/` asset directory) 
 * and inline literal SVG HTML tags.
 * 
 * @internal Executed via `provideAppInitializer` during application bootstrap.
 */
function configureIcons(): void {
  const registry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);
  const baseIconPath = '/images/svg/';

  // Register external SVG assets from the public images directory
  SvgIcons.forEach((iconName) => {
    registry.addSvgIcon(
      iconName,
      sanitizer.bypassSecurityTrustResourceUrl(`${baseIconPath}${iconName}.svg`)
    );
  });

  // Register raw inline SVG HTML strings
  SVG_ICONS.forEach((icon) => {
    registry.addSvgIconLiteral(
      icon.name,
      sanitizer.bypassSecurityTrustHtml(icon.tag)
    );
  });
}

/**
 * Configures environment-level providers for Angular Material components.
 * 
 * Integrates the `date-fns` DateAdapter engine with custom date/time formats and
 * initializes global SVG icon registries during application bootstrapping via `provideAppInitializer`.
 * 
 * @example
 * // In app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     configureMaterialProvider(),
 *     // ... other environment providers
 *   ]
 * };
 * 
 * @returns {EnvironmentProviders} Encapsulated Angular Material environment providers.
 */
export function configureMaterialProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAT_CARD_CONFIG, useValue: CUSTOM_CARD_CONFIG },
    provideDateFnsAdapter(CUSTOM_DATE_FORMATS),
    provideAppInitializer(() => configureIcons()),
  ]);
}