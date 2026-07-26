import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_CARD_CONFIG } from '@angular/material/card';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TranslateLangService } from '@core';
import { BASE_URL, interceptors } from '@core';
import { environment } from '@env/environment';
import { PaginatorI18nService } from '@shared';
import { SettingsService } from '@core/settings/settings.service';
import { catchError, of, take, timeout } from 'rxjs';
import { AuthService } from './routes/auth';
import { getConfiguredECharts } from './configs/e-chart.config';
import { createApollo } from './configs/graphql.config';
import { provideEchartsCore } from 'ngx-echarts';
import { APP_ROUTES } from './app.routes';
import { provideApollo } from 'apollo-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotToastConfig(),
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors(interceptors)),
    importProvidersFrom(NgxPermissionsModule.forRoot()),
    provideAppInitializer(() => inject(TranslateLangService).load()),

    provideAppInitializer(() =>
      inject(AuthService)
        .fetchUser()
        .pipe(
          timeout(5000),
          catchError((error) => {
            console.warn(
              'Startup user check failed; continuing without blocking app render.',
              error,
            );
            return of({});
          }),
          take(1),
        ),
    ), // get user on startup without blocking app render indefinitely

    provideAppInitializer(async () => inject(SettingsService)),
    provideEchartsCore({ echarts: getConfiguredECharts() }),

    provideApollo(createApollo),

    provideRouter(
      APP_ROUTES,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withComponentInputBinding(),
    ),

    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: 'i18n/', suffix: '.json' }),
    }),

    {
      provide: MatPaginatorIntl,
      deps: [PaginatorI18nService],
      useFactory: (paginatorI18nSrv: PaginatorI18nService) => paginatorI18nSrv.getPaginatorIntl(),
    },

    { provide: BASE_URL, useValue: environment.baseUrl },

    {
      provide: MAT_CARD_CONFIG,
      useValue: { appearance: 'outlined' },
    },

    provideDateFnsAdapter({
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
    }),
  ],
};
