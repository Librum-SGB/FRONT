import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_KEY } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (!token || request.url.endsWith('/auth/login')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};