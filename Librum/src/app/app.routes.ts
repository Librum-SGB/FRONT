import { Routes } from '@angular/router';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { App } from './app';
import { Dashboard } from './pages/dashboard/dashboard';
import { CadastrarMaterial } from './pages/cadastrar-material/cadastrar-material';
import { TelaLoginComponent } from './pages/tela-login/tela-login';
import { EditarExcluirMaterial } from './pages/editar-excluir-material/editar-excluir-material';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: '', component: TelaLoginComponent },
  { path: 'estanteVirtual', component: EncontrarMaterial },
  { path: 'cadastrarMaterial', component: CadastrarMaterial },
  { path: 'editarExcluirMaterial', component: EditarExcluirMaterial }
];
