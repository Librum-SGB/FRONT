import { Routes } from '@angular/router';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { Dashboard } from './pages/dashboard/dashboard';
import { CadastrarMaterial } from './pages/cadastrar-material/cadastrar-material';
import { TelaLoginComponent } from './pages/tela-login/tela-login';
import { EditarExcluirMaterial } from './pages/editar-excluir-material/editar-excluir-material';
import { EsqueciSenhaComponent } from './pages/esqueci-senha/esqueci-senha';
import { CadastroBibliotecariaComponent } from './pages/cadastro-bibliotecaria/cadastro-bibliotecaria';

export const routes: Routes = [
  { path: '', component: TelaLoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'estanteVirtual', component: EncontrarMaterial },
  { path: 'cadastrarMaterial', component: CadastrarMaterial },
  { path: 'editarExcluirMaterial', component: EditarExcluirMaterial },
  { path: 'cadastro-bibliotecaria', component: CadastroBibliotecariaComponent },
];
