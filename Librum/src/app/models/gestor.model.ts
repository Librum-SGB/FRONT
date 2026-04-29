export interface Gestor {
  id?: number;

  login: string;
  senha: string;
  matriculaFuncionario: string;

  ultimoAcesso?: Date;

  filialId: number;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
