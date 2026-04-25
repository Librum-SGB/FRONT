export interface EstanteVirtualDto {
  id: number;
  localizacao: string;
  capacidade?: number;

  prateleiras: PrateleiraVirtualDto[];
}

// ----------------------------

export interface PrateleiraVirtualDto {
  nome: string; // ex: "A1", "B2"

  exemplares: ExemplarVirtualDto[];
}

// ----------------------------

export interface ExemplarVirtualDto {
  id: number;

  codigoBarras: string;
  status: string;

  posicao?: string;

  livro: LivroVirtualDto;
}

// ----------------------------

export interface LivroVirtualDto {
  id: number;

  titulo: string;

  autores: string[];
  generos: string[];

  editora?: string;

  anoPublicacao?: number;
  isbn?: string;
}
