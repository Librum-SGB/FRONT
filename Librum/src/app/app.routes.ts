import { Routes } from '@angular/router';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { App } from './app';
import { Dashboard } from './pages/dashboard/dashboard';
import { TelaLoginComponent } from './pages/tela-login/tela-login';

export const routes: Routes = [
  { path: '', component: TelaLoginComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'estanteVirtual', component: EncontrarMaterial },
];
