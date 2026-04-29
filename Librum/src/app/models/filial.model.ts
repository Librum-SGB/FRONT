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

  ativo: boolean;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
