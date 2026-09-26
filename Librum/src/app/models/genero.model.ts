export interface GeneroRequest {
  nome: string;
  descricao?: string;
}

export interface GeneroResponse {
  id: number;
  nome: string;
  descricao?: string;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}