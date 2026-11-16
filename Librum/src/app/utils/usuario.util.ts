import { Usuario } from '../models/usuario.model';

export type SituacaoUsuario = 'ATIVO' | 'BLOQUEADO' | 'INATIVO';

/** Inativo tem prioridade: a conta nem entra no sistema, esteja bloqueada ou não. */
export function situacaoUsuario(usuario: Usuario): SituacaoUsuario {
  if (usuario.ativo === false) return 'INATIVO';
  if (usuario.estaBloqueado) return 'BLOQUEADO';
  return 'ATIVO';
}

export const ROTULOS_SITUACAO_USUARIO: Record<SituacaoUsuario, string> = {
  ATIVO: 'Ativo',
  BLOQUEADO: 'Bloqueado',
  INATIVO: 'Inativo',
};

/** Opções do filtro "Status" (iguais nas telas de Usuários e Funcionários). */
export const OPCOES_SITUACAO_USUARIO = Object.entries(ROTULOS_SITUACAO_USUARIO).map(([valor, rotulo]) => ({
  valor,
  rotulo,
}));

const CORES: Record<SituacaoUsuario, 'success' | 'danger' | 'secondary'> = {
  ATIVO: 'success',
  BLOQUEADO: 'danger',
  INATIVO: 'secondary',
};

export function rotuloSituacaoUsuario(usuario: Usuario): string {
  return ROTULOS_SITUACAO_USUARIO[situacaoUsuario(usuario)];
}

export function corSituacaoUsuario(usuario: Usuario): 'success' | 'danger' | 'secondary' {
  return CORES[situacaoUsuario(usuario)];
}
