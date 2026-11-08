import { FuncaoUsuario } from './funcaoUsuario.enum';

export enum Permissao {
  // Dashboard e relatórios
  VER_DASHBOARD = 'VER_DASHBOARD',
  VER_RELATORIOS = 'VER_RELATORIOS',
  GERAR_RELATORIOS = 'GERAR_RELATORIOS',
  EXPORTAR_RELATORIOS = 'EXPORTAR_RELATORIOS',

  // Acervo
  CADASTRAR_MATERIAL = 'CADASTRAR_MATERIAL',
  EDITAR_MATERIAL = 'EDITAR_MATERIAL',
  EXCLUIR_MATERIAL = 'EXCLUIR_MATERIAL',

  // Empréstimos
  GERENCIAR_EMPRESTIMOS = 'GERENCIAR_EMPRESTIMOS', // emprestar, devolver, renovar
  GERENCIAR_MULTAS = 'GERENCIAR_MULTAS', // multas e bloqueios
  VER_HISTORICO_GERAL = 'VER_HISTORICO_GERAL', // histórico de todos

  // Usuários
  VER_USUARIOS = 'VER_USUARIOS', // só consulta
  CRIAR_USUARIO = 'CRIAR_USUARIO',
  EDITAR_USUARIO = 'EDITAR_USUARIO',
  EXCLUIR_USUARIO = 'EXCLUIR_USUARIO',
  CADASTRAR_BIBLIOTECARIA = 'CADASTRAR_BIBLIOTECARIA',

  // Sistema
  CONFIGURAR_SISTEMA = 'CONFIGURAR_SISTEMA',
  EXCLUIR_PERMANENTEMENTE = 'EXCLUIR_PERMANENTEMENTE',
}

const P = Permissao;

export const PERMISSOES_POR_FUNCAO: Record<FuncaoUsuario, Permissao[]> = {
  [FuncaoUsuario.ADMIN]: Object.values(Permissao),

  [FuncaoUsuario.BIBLIOTECARIA]: [
    P.VER_DASHBOARD,
    P.VER_RELATORIOS,
    P.GERAR_RELATORIOS,
    P.EXPORTAR_RELATORIOS,
    P.CADASTRAR_MATERIAL,
    P.EDITAR_MATERIAL,
    P.EXCLUIR_MATERIAL,
    P.GERENCIAR_EMPRESTIMOS,
    P.GERENCIAR_MULTAS,
    P.VER_HISTORICO_GERAL,
    P.VER_USUARIOS,
    P.CRIAR_USUARIO,
    P.EDITAR_USUARIO,
    P.EXCLUIR_USUARIO,
  ],

  [FuncaoUsuario.ASSISTENTE]: [
    P.VER_DASHBOARD,
    P.VER_RELATORIOS,
    P.GERENCIAR_EMPRESTIMOS,
    P.VER_HISTORICO_GERAL,
    P.VER_USUARIOS,
  ],

  [FuncaoUsuario.USUARIO]: [],
};

/** Quais funções cada função pode criar/editar/excluir */
export const FUNCOES_GERENCIAVEIS: Record<FuncaoUsuario, FuncaoUsuario[]> = {
  [FuncaoUsuario.ADMIN]: Object.values(FuncaoUsuario),
  [FuncaoUsuario.BIBLIOTECARIA]: [FuncaoUsuario.ASSISTENTE, FuncaoUsuario.USUARIO],
  [FuncaoUsuario.ASSISTENTE]: [],
  [FuncaoUsuario.USUARIO]: [],
};
