export interface Livro {
  id?: number;

  editoraId: number;

  titulo: string;
  isbn?: string;

  edicao?: number;
  anoPublicacao?: number;
  quantidadePaginas?: number;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
