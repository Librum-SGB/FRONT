export interface Estante {
  id?: number;

  localizacao: string;
  capacidade?: number;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
