export interface Autor {
  id?: number;

  nome: string;
  nacionalidade?: string;

  dataNascimento?: Date;
  dataFalecimento?: Date;

  biografia?: string;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
