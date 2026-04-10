export interface Material {
  codigo: string;
  titulo: string;
  autor: string;
  genero: string;
  unidade: string;

  subtitulo?: string;
  editora?: string;
  ano?: number;
  isbn?: string;
  edicao?: string;
  qtd?: number;
}