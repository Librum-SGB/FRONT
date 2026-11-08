export interface EstanteVirtualDto {
  id: number;
  nome: string;
  filialId: number;
  localizacao: string;
  capacidade?: number;
  prateleiras: PrateleiraVirtualDto[];
}

export interface EstantePrateleiraDto {
  id?: number;
  nome: string;
  posicaoInicial: number;
  posicaoFinal: number;
  ordem: number;
}

export interface EstanteRequestDto {
  nome: string;
  localizacao: string;
  capacidade?: number;
  qtdPrateleiras: number;
  prateleiras?: EstantePrateleiraDto[];
}

export interface EstanteResponseDto {
  id: number;
  filialId: number;
  nome: string;
  localizacao: string;
  capacidade?: number;
  qtdPrateleiras: number;
  prateleiras?: EstantePrateleiraDto[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface PrateleiraVirtualDto {
  id?: number;
  nome: string;
  posicaoInicial: number;
  posicaoFinal: number;
  ordem: number;
  exemplares: ExemplarVirtualDto[];
}

export interface ExemplarVirtualDto {
  id: number;
  codigoBarras: string;
  status?: string;
  prateleira?: string;
  posicao?: string;
  material: MaterialVirtualDto;
}

export interface MaterialVirtualDto {
  id: number;
  titulo: string;
  tipo: string;
  autores: string[];
  anoPublicacao?: number;
  isbn?: string;
  issn?: string;
  descricao?: string;
  sinopse?: string;
}
