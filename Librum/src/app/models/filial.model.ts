export interface Filial {
  id?: number; // opcional (quando ainda não foi salvo)

  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual?: string;

  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;

  telefone?: string;
  email?: string;
  horarioFuncionamento?: string;

  ativo: boolean;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}

export type FilialRequest = Omit<Filial, 'id' | 'dataCriacao' | 'dataUltimaAtualizacao'>;

export interface FilialResponse extends FilialRequest {
  id: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}
