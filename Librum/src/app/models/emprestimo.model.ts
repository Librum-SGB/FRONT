export interface Emprestimo {
  id?: number;

  usuarioId: number;
  exemplarId: number;
  gestorId: number;

  dataSaida?: Date;
  dataDevolucaoPrevista: Date;
  dataDevolucaoEfetivada?: Date;

  renovacoesContagem?: number;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
