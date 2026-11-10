import { StatusEmprestimo } from "../enum/status.enum";

export interface Emprestimo {
  id?: number;

  usuarioId: number;
  usuarioNome?: string;
  exemplarId: number;
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