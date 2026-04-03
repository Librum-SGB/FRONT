import { Prateleira } from './prateleira.model';

export interface Estante {
  id: number;
  nome: string;
  prateleiras: Prateleira[];
}
