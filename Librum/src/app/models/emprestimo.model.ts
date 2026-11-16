import { StatusEmprestimo } from "../enum/status.enum";

export interface Emprestimo {
  id?: number;

  usuarioId: number;
  usuarioNome?: string;
  exemplarId: number;
  materialId?: number;
  materialTitulo?: string;
  gestorId?: number;
  usuarioResponsavelId?: number;

  dataSaida?: Date | string;

  dataDevolucaoPrevista: Date | string;
  dataDevolucaoEfetivada?: Date | string;

  renovacoesContagem?: number;

  diasAtraso?: number;

  status?: StatusEmprestimo;

  penalidadeDias?: number;

  observacao?: string;

  dataCriacao?: Date | string;
  dataUltimaAtualizacao?: Date | string;
}

/** Simulação da renovação devolvida pelo backend (GET /emprestimos/{id}/renovacao). */
export interface RenovacaoPrevia {
  emprestimoId: number;
  permitida: boolean;
  motivo?: string;
  dataDevolucaoAtual: string;
  novaDataDevolucao?: string;
  renovacoesRealizadas: number;
  limiteRenovacoes?: number;
  /** Quando permitida: quantas restam depois desta. Senão: quantas restam agora. */
  renovacoesRestantes?: number;
}