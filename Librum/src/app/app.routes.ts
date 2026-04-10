import { Routes } from '@angular/router';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { Dashboard } from './pages/dashboard/dashboard';
import { CadastrarMaterial } from './pages/cadastrar-material/cadastrar-material';
import { TelaLoginComponent } from './pages/tela-login/tela-login';
import { EsqueciSenhaComponent } from './pages/esqueci-senha/esqueci-senha';

export const routes: Routes = [
  { path: '', component: TelaLoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'estanteVirtual', component: EncontrarMaterial },
  { path: 'cadastrarMaterial', component: CadastrarMaterial },
];
