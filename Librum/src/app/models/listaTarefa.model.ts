import { prioridade } from '../enum/prioridade.enum';

export interface ListaTarefa {
  id?: number;

  gestorId: number;

  descricao: string;
  prioridade?: prioridade;

  concluida?: boolean;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
