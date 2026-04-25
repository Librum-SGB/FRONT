export interface Exemplar {
  id?: number;

  livroId: number;
  filialId: number;
  estanteId: number;

  prateleira?: string;
  posicao?: string;

  codigoBarras: string;

  status?: string;

  dataAquisicao?: Date;
  observacoes?: string;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
