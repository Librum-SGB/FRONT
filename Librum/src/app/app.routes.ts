import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { Bloqueios } from './pages/bloqueios/bloqueios';
import { CadastrarMaterial } from './pages/cadastrar-material/cadastrar-material';
import { CadastrarUsuario } from './pages/cadastrar-usuario/cadastrar-usuario';
import { CadastroBibliotecariaComponent } from './pages/cadastro-bibliotecaria/cadastro-bibliotecaria';
import { ChatSuporte } from './pages/chat-suporte/chat-suporte';
import { Configuracoes } from './pages/configuracoes/configuracoes';
import { Dashboard } from './pages/dashboard/dashboard';
import { EditarExcluirMaterial } from './pages/editar-excluir-material/editar-excluir-material';
import { EditarExcluirUsuario } from './pages/editar-excluir-usuario/editar-excluir-usuario';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { EsqueciSenhaComponent } from './pages/esqueci-senha/esqueci-senha';
import { HistorioEmprestimo } from './pages/historico-emprestimo/historico-emprestimo';
import { Monitoramento } from './pages/monitoramento/monitoramento';
import { Relatorio } from './pages/relatorio/relatorio';
import { Configuracoes } from './pages/configuracoes/configuracoes';
import { RenovarDevolverMaterial } from './pages/renovar-devolver-material/renovar-devolver-material';
import { ReservarMaterial } from './pages/reservar-material/reservar-material';
import { AcessoNegado } from './pages/acesso-negado/acesso-negado';

// ajuste os caminhos conforme sua estrutura

import { Permissao } from './enum/permissoes.enum';
import { authGuard, permissaoGuard } from './services/auth.guard';

const P = Permissao;
import { TelaLoginComponent } from './pages/tela-login/tela-login';
import { TelaSuporte } from './pages/tela-suporte/tela-suporte';

export const routes: Routes = [
  // ── Públicas ──────────────────────────────────────────────
  { path: '', component: TelaLoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'acesso-negado', component: AcessoNegado },

  // ── Qualquer usuário logado ───────────────────────────────
  { path: 'estanteVirtual', component: EncontrarMaterial, canActivate: [authGuard] },
  { path: 'historicoEmprestimo', component: HistorioEmprestimo, canActivate: [authGuard] }, // usuário vê só o dele
  { path: 'reservar', component: ReservarMaterial, canActivate: [authGuard] },
  { path: 'reservar-material', component: ReservarMaterial, canActivate: [authGuard] },
  { path: 'suporte', component: TelaSuporte, canActivate: [authGuard] },
  { path: 'chat-suporte', component: ChatSuporte, canActivate: [authGuard] },
  { path: 'configuracoes', component: Configuracoes, canActivate: [authGuard] }, // veja observação abaixo

  // ── Dashboard e relatórios (admin, bibliotecária, assistente) ──
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.VER_DASHBOARD] },
  },
  {
    path: 'relatorio',
    component: Relatorio,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.VER_RELATORIOS] },
  },
  {
    path: 'monitoramento',
    component: Monitoramento,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.CONFIGURAR_SISTEMA] }, // só admin
  },
  // ── Acervo (admin, bibliotecária) ─────────────────────────
  {
    path: 'cadastrarMaterial',
    component: CadastrarMaterial,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.CADASTRAR_MATERIAL] },
  },
  {
    path: 'editarExcluirMaterial',
    component: EditarExcluirMaterial,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.EDITAR_MATERIAL] },
  },

  // ── Empréstimos ───────────────────────────────────────────
  {
    path: 'renovar-devolver',
    component: RenovarDevolverMaterial,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.GERENCIAR_EMPRESTIMOS] }, // admin, bibliotecária, assistente
  },
  {
    path: 'bloqueios',
    component: Bloqueios,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.GERENCIAR_MULTAS] }, // admin, bibliotecária
  },

  // ── Usuários ──────────────────────────────────────────────
  {
    path: 'cadastrar-usuario',
    component: CadastrarUsuario,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.CRIAR_USUARIO] }, // admin, bibliotecária
  },
  {
    path: 'editar-excluir-usuario',
    component: EditarExcluirUsuario,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.VER_USUARIOS] }, // assistente só consulta (botões escondidos com @if)
  },
  {
    path: 'cadastro-bibliotecaria',
    component: CadastroBibliotecariaComponent,
    canActivate: [permissaoGuard],
    data: { permissoes: [P.CADASTRAR_BIBLIOTECARIA] }, // só admin
  },

  // ── Rota inexistente  ──────────────────
  { path: '**', redirectTo: '' },
];
