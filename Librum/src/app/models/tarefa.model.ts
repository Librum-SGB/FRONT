import { prioridade } from '../enum/prioridade.enum';
import { StatusTarefa } from '../enum/status.enum';

export interface Tarefa {
  id: number;
  usuarioId: number;
  descricao: string;
  prioridade: prioridade;
  status: StatusTarefa;
  prazo?: string | null;
  dataCriacao?: string;
  dataUltimaAtualizacao?: string;
}

export type TarefaRequest = Pick<Tarefa, 'descricao' | 'prioridade' | 'status'> & {
  usuarioId?: number;
  prazo?: string | null;
};
