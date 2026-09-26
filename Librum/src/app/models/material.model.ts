// material.model.ts
export interface MaterialRequest {
  titulo: string;
  editoraId?: number;
  tipo: 'LIVRO' | 'PERIODICO' | 'OUTROS'; // confirme os valores reais do enum
  subtitulo?: string;
  autorId?: number;
  sinopse?: string;
  issn?: string;
  tema?: string;
  descricao?: string;
  observacao?: string;
  isbn?: string;
  edicao?: number;
  anoPublicacao?: number;
  quantidadePaginas?: number;
  autorIds?: number[];
  generoIds?: number[];
}

export interface MaterialResponse {
  id: number;
  titulo: string;
  tipo: string;
  subtitulo?: string;
  autorId?: number;
  sinopse?: string;
  issn?: string;
  tema?: string;
  descricao?: string;
  observacao?: string;
  isbn?: string;
  edicao?: number;
  anoPublicacao?: number;
  quantidadePaginas?: number;
  editoraId?: number;
  autorIds?: number[];
  generoIds?: number[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}