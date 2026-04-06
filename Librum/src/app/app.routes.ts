import { Routes } from '@angular/router';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { App } from './app';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'estanteVirtual', component: EncontrarMaterial },
];
