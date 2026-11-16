import { Routes } from '@angular/router';
import { Bloqueios } from './pages/bloqueios/bloqueios';
import { CadastrarMaterial } from './pages/cadastrar-material/cadastrar-material';
import { CadastrarUsuario } from './pages/cadastrar-usuario/cadastrar-usuario';
import { CadastroBibliotecariaComponent } from './pages/cadastro-bibliotecaria/cadastro-bibliotecaria';
import { Configuracoes } from './pages/configuracoes/configuracoes';
import { Dashboard } from './pages/dashboard/dashboard';
import { EditarExcluirMaterial } from './pages/editar-excluir-material/editar-excluir-material';
import { EditarExcluirUsuario } from './pages/editar-excluir-usuario/editar-excluir-usuario';
import { EncontrarMaterial } from './pages/encontrar-material/encontrar-material';
import { EsqueciSenhaComponent } from './pages/esqueci-senha/esqueci-senha';
import { HistorioEmprestimo } from './pages/historico-emprestimo/historico-emprestimo';
import { Monitoramento } from './pages/monitoramento/monitoramento';
import { Relatorio } from './pages/relatorio/relatorio';
import { RenovarDevolverMaterial } from './pages/renovar-devolver-material/renovar-devolver-material';
import { ReservarMaterial } from './pages/reservar-material/reservar-material';
import { AcessoNegado } from './pages/acesso-negado/acesso-negado';
import { DetalheMaterial } from './pages/detalhe-material/detalhe-material';
import { DetalheUsuario } from './pages/detalhe-usuario/detalhe-usuario';
import { EdicaoMaterial } from './pages/edicao-material/edicao-material';
import { EdicaoUsuario } from './pages/edicao-usuario/edicao-usuario';
import { DetalheEmprestimo } from './pages/detalhe-emprestimo/detalhe-emprestimo';
import { ListaCadastro } from './pages/cadastros-acervo/lista-cadastro/lista-cadastro';
import { DetalheCadastro } from './pages/cadastros-acervo/detalhe-cadastro/detalhe-cadastro';
import { FormularioCadastro } from './pages/cadastros-acervo/formulario-cadastro/formulario-cadastro';
import { Funcionarios } from './pages/funcionarios/funcionarios';
import { CadastroFuncionario } from './pages/cadastro-funcionario/cadastro-funcionario';

// ajuste os caminhos conforme sua estrutura

import { Permissao } from './enum/permissoes.enum';
import { authGuard, permissaoGuard } from './services/auth.guard';

const P = Permissao;
import { TelaLoginComponent } from './pages/tela-login/tela-login';
import { TelaSuporte } from './pages/tela-suporte/tela-suporte';

/** Listagem, cadastro, detalhe e edição de um cadastro do acervo (autor, editora ou gênero). */
function rotasDoCadastro(caminho: string, cadastro: string, plural: string, singular: string): Routes {
  const acesso = { canActivate: [permissaoGuard] };
  return [
    { path: caminho, component: ListaCadastro, ...acesso, data: { cadastro, titulo: plural, permissoes: [P.EDITAR_MATERIAL] } },
    {
      path: `${caminho}/novo`,
      component: FormularioCadastro,
      ...acesso,
      data: { cadastro, titulo: `Cadastrar ${singular}`, permissoes: [P.EDITAR_MATERIAL] },
    },
    { path: `${caminho}/:id`, component: DetalheCadastro, ...acesso, data: { cadastro, titulo: singular, permissoes: [P.EDITAR_MATERIAL] } },
    {
      path: `${caminho}/:id/editar`,
      component: FormularioCadastro,
      ...acesso,
      data: { cadastro, titulo: `Editar ${singular}`, permissoes: [P.EDITAR_MATERIAL] },
    },
  ];
}

export const routes: Routes = [
  // ── Públicas ──────────────────────────────────────────────
  { path: '', component: TelaLoginComponent },
  { path: 'esqueci-senha', component: EsqueciSenhaComponent },
  { path: 'acesso-negado', component: AcessoNegado },

  // ── Qualquer usuário logado ───────────────────────────────
  { path: 'estanteVirtual', component: EncontrarMaterial, canActivate: [authGuard], data: { titulo: 'Estante Virtual' } },
  { path: 'historicoEmprestimo', component: HistorioEmprestimo, canActivate: [authGuard], data: { titulo: 'Histórico de Empréstimos' } }, // usuário vê só o dele
  // O backend só devolve o empréstimo ao próprio usuário ou à equipe; renovar/devolver dependem de permissão.
  { path: 'emprestimos/:id', component: DetalheEmprestimo, canActivate: [authGuard], data: { titulo: 'Empréstimo' } },
  {
    path: 'reservar',
    component: ReservarMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Realizar Empréstimo', permissoes: [P.GERENCIAR_EMPRESTIMOS] },
  },
  {
    path: 'reservar-material',
    component: ReservarMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Realizar Empréstimo', permissoes: [P.GERENCIAR_EMPRESTIMOS] },
  },
  { path: 'suporte', component: TelaSuporte, canActivate: [authGuard], data: { titulo: 'Suporte' } },
  { path: 'chat-suporte', component: TelaSuporte, canActivate: [authGuard], data: { titulo: 'Suporte' } },
  { path: 'configuracoes', component: Configuracoes, canActivate: [authGuard], data: { titulo: 'Configurações' } }, // veja observação abaixo

  // ── Dashboard e relatórios (admin, bibliotecária, assistente) ──
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [permissaoGuard],
    data: { titulo: 'Dashboard', permissoes: [P.VER_DASHBOARD] },
  },
  {
    path: 'relatorio',
    component: Relatorio,
    canActivate: [permissaoGuard],
    data: { titulo: 'Relatórios', permissoes: [P.VER_RELATORIOS] },
  },
  {
    path: 'monitoramento',
    component: Monitoramento,
    canActivate: [permissaoGuard],
    data: { titulo: 'Monitoramento', permissoes: [P.CONFIGURAR_SISTEMA] }, // só admin
  },
  // ── Acervo (admin, bibliotecária) ─────────────────────────
  {
    path: 'cadastrarMaterial',
    component: CadastrarMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Cadastrar Material', permissoes: [P.CADASTRAR_MATERIAL] },
  },
  {
    path: 'editarExcluirMaterial',
    component: EditarExcluirMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Materiais', permissoes: [P.EDITAR_MATERIAL] },
  },
  {
    path: 'materiais/:id',
    component: DetalheMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Material', permissoes: [P.EDITAR_MATERIAL] }, // mesma permissão da listagem de materiais
  },
  {
    path: 'materiais/:id/editar',
    component: EdicaoMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Editar material', permissoes: [P.EDITAR_MATERIAL] },
  },

  // ── Autores, editoras e gêneros (mesmas telas, cadastro definido em data.cadastro) ──
  ...rotasDoCadastro('autores', 'autor', 'Autores', 'Autor'),
  ...rotasDoCadastro('editoras', 'editora', 'Editoras', 'Editora'),
  ...rotasDoCadastro('generos', 'genero', 'Gêneros', 'Gênero'),

  // ── Empréstimos ───────────────────────────────────────────
  {
    path: 'renovar-devolver',
    component: RenovarDevolverMaterial,
    canActivate: [permissaoGuard],
    data: { titulo: 'Renovar / Devolver', permissoes: [P.GERENCIAR_EMPRESTIMOS] }, // admin, bibliotecária, assistente
  },
  {
    path: 'bloqueios',
    component: Bloqueios,
    canActivate: [permissaoGuard],
    data: { titulo: 'Bloqueios', permissoes: [P.GERENCIAR_MULTAS] }, // admin, bibliotecária
  },

  // ── Usuários ──────────────────────────────────────────────
  {
    path: 'cadastrar-usuario',
    component: CadastrarUsuario,
    canActivate: [permissaoGuard],
    data: { titulo: 'Cadastrar Usuário', permissoes: [P.CRIAR_USUARIO] }, // admin, bibliotecária
  },
  {
    path: 'editar-excluir-usuario',
    component: EditarExcluirUsuario,
    canActivate: [permissaoGuard],
    data: { titulo: 'Usuários', permissoes: [P.VER_USUARIOS] }, // assistente só consulta (botões escondidos com @if)
  },
  {
    path: 'usuarios/:id',
    component: DetalheUsuario,
    canActivate: [permissaoGuard],
    data: { titulo: 'Usuário', permissoes: [P.VER_USUARIOS] }, // editar/excluir dependem das permissões específicas
  },
  {
    path: 'usuarios/:id/editar',
    component: EdicaoUsuario,
    canActivate: [permissaoGuard],
    data: { titulo: 'Editar usuário', permissoes: [P.EDITAR_USUARIO] },
  },
  {
    path: 'funcionarios',
    component: Funcionarios,
    canActivate: [permissaoGuard],
    data: { titulo: 'Funcionários', permissoes: [P.EDITAR_USUARIO] }, // admin, bibliotecária
  },
  {
    path: 'funcionarios/novo',
    component: CadastroFuncionario,
    canActivate: [permissaoGuard],
    data: { titulo: 'Cadastrar Funcionário', permissoes: [P.CRIAR_USUARIO] },
  },
  {
    path: 'cadastro-bibliotecaria',
    component: CadastroBibliotecariaComponent,
    canActivate: [permissaoGuard],
    data: { titulo: 'Cadastrar Bibliotecária', permissoes: [P.CADASTRAR_BIBLIOTECARIA] }, // só admin
  },

  // ── Rota inexistente  ──────────────────
  { path: '**', redirectTo: '' },
];
