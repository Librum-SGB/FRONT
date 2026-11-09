import { prioridade } from '../enum/prioridade.enum';

export interface Tarefa {
  id?: number;
  usuarioId?: number;
  descricao: string;
  prioridade?: prioridade;
  concluida?: boolean;
  status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  prazo?: string;
  dataCriacao?: string;
  dataUltimaAtualizacao?: string;
}
