import { Routes } from '@angular/router';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { App } from './app';
import { Dashboard } from './pages/dashboard/dashboard';
<<<<<<< HEAD
import { TelaLoginComponent } from './pages/tela-login/tela-login';

export const routes: Routes = [
  { path: '', component: TelaLoginComponent },
  { path: 'dashboard', component: Dashboard },
=======
import { CadastrarMaterial } from './pages/cadastrar-material/cadastrar-material';
import { TelaLoginComponent } from './pages/tela-login/tela-login';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: '', component: TelaLoginComponent },
>>>>>>> afed2f9e55770aea33cf6d9ac57256c35f06f983
  { path: 'estanteVirtual', component: EncontrarMaterial },
  { path: 'cadastrarMaterial', component: CadastrarMaterial },
];
