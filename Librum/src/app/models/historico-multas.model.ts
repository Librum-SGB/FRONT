export interface HistoricoMulta {
  id?: number;

  emprestimoId: number;

  valor: number;
  diasAtraso: number;

  pago?: boolean;
  dataPagamento?: Date;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
