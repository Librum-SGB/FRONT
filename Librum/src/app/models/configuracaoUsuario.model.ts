export interface ConfiguracaoUsuario {
  id?: number;

  filialId: number;

  chave: string;
  valor: string;
  descricao?: string;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
