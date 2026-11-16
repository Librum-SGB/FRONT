import { StatusEmprestimo } from '../enum/status.enum';
import { Emprestimo } from '../models/emprestimo.model';
import { dataISO } from './data.util';

export type CorSituacao = 'success' | 'warning' | 'danger' | 'primary' | 'secondary';

export function estaEmAberto(emprestimo: Emprestimo): boolean {
  return emprestimo.status === StatusEmprestimo.ATIVO || emprestimo.status === StatusEmprestimo.ATRASADO;
}

/** Dias de atraso de um empréstimo em aberto (0 se estiver no prazo). */
export function diasDeAtraso(emprestimo: Emprestimo, hoje = new Date()): number {
  if (!estaEmAberto(emprestimo) || !emprestimo.dataDevolucaoPrevista) return 0;
  const prevista = new Date(`${dataISO(emprestimo.dataDevolucaoPrevista)}T00:00:00`);
  const inicioDoDia = new Date(`${dataISO(hoje)}T00:00:00`);
  const dias = Math.round((inicioDoDia.getTime() - prevista.getTime()) / 86_400_000);
  return Math.max(0, dias);
}

/** Situação real: um empréstimo "ATIVO" com a data vencida já é considerado atrasado. */
export function situacaoEmprestimo(emprestimo: Emprestimo): StatusEmprestimo {
  if (emprestimo.status === StatusEmprestimo.DEVOLVIDO) return StatusEmprestimo.DEVOLVIDO;
  if (emprestimo.status === StatusEmprestimo.BLOQUEADO) return StatusEmprestimo.BLOQUEADO;
  if (emprestimo.status === StatusEmprestimo.ATRASADO || diasDeAtraso(emprestimo) > 0) {
    return StatusEmprestimo.ATRASADO;
  }
  return StatusEmprestimo.ATIVO;
}

const ROTULOS: Record<StatusEmprestimo, string> = {
  [StatusEmprestimo.ATIVO]: 'Em andamento',
  [StatusEmprestimo.ANDAMENTO]: 'Em andamento',
  [StatusEmprestimo.DEVOLVIDO]: 'Devolvido',
  [StatusEmprestimo.ATRASADO]: 'Atrasado',
  [StatusEmprestimo.BLOQUEADO]: 'Bloqueado',
};

const CORES: Record<StatusEmprestimo, CorSituacao> = {
  [StatusEmprestimo.ATIVO]: 'primary',
  [StatusEmprestimo.ANDAMENTO]: 'primary',
  [StatusEmprestimo.DEVOLVIDO]: 'success',
  [StatusEmprestimo.ATRASADO]: 'danger',
  [StatusEmprestimo.BLOQUEADO]: 'warning',
};

export function rotuloSituacao(emprestimo: Emprestimo): string {
  return ROTULOS[situacaoEmprestimo(emprestimo)];
}

export function corSituacao(emprestimo: Emprestimo): CorSituacao {
  return CORES[situacaoEmprestimo(emprestimo)];
}
