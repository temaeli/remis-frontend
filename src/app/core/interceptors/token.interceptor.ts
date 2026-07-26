import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { TokenService } from 'app/routes/auth/token.service';

// Routes that should NOT include the Authorization token
const NON_TOKEN_ROUTES = ['auth/', '/auth', 'oauth/token', '/oauth/token'];

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Get bearer token from TokenService
  const bearerToken = tokenService.getBearerToken();

  // Check if this request should have the token
  const shouldHaveToken = !NON_TOKEN_ROUTES.some((route) => req.url.includes(route));

  if (bearerToken && shouldHaveToken) {
    const clonedReq = req.clone({ headers: req.headers.append('Authorization', bearerToken) });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) tokenService.clear();
        return throwError(() => error);
      }),
    );
  }

  return next(req);
}
