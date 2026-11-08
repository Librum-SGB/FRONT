import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Permissao } from '../enum/permissoes.enum';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogado()) return true;
  auth.logout();
  return router.createUrlTree(['/']);
};

export const permissaoGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaLogado()) {
    auth.logout();
    return router.createUrlTree(['/']);
  }

  const necessarias = (route.data?.['permissoes'] as Permissao[]) ?? [];
  return auth.temPermissao(...necessarias) ? true : router.createUrlTree(['/acesso-negado']);
};
