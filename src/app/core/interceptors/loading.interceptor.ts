import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { loadingService } from '@core/loading/loader.service';

let activeHttpRequests = 0;

export function loadingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const loader = inject(loadingService);

  if (activeHttpRequests === 0) {
    loader.show('app-loading-root');
  }

  activeHttpRequests++;

  return next(req).pipe(
    finalize(() => {
      activeHttpRequests = Math.max(activeHttpRequests - 1, 0);
      if (activeHttpRequests === 0) {
        loader.hide('app-loading-root');
      }
    }),
  );
}
