import { StatusEmprestimo } from "../enum/status.enum";

export interface Emprestimo {
  id?: number;

  usuarioId: number;
  exemplarId: number;
  gestorId: number;

  dataSaida?: Date;

  dataDevolucaoPrevista: Date;
  dataDevolucaoEfetivada?: Date;

  renovacoesContagem?: number;

  diasAtraso?: number;

  status?: StatusEmprestimo;

  penalidadeDias?: number;

  observacao?: string;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}