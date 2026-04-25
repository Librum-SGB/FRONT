export interface Usuario {
  id?: number;

  nome: string;
  cpf: string;
  email: string;
  telefone: string;

  dataNascimento: Date;

  filialId: number;

  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;

  limiteLivros?: number;
  estaBloqueado?: boolean;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
