export interface AutorRequest {
  nome: string;
  nacionalidade?: string;
  dataNascimento?: string; // formato 'YYYY-MM-DD'
  dataFalecimento?: string;
  biografia?: string;
}

export interface AutorResponse {
  id: number;
  nome: string;
  nacionalidade?: string;
  dataNascimento?: string;
  dataFalecimento?: string;
  biografia?: string;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}