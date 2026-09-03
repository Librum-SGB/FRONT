export interface EditoraRequest {
  nome: string;
  nacionalidade?: string;
}

export interface EditoraResponse {
  id: number;
  nome: string;
  nacionalidade?: string;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}