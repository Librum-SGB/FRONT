import { FuncaoUsuario } from '../enum/funcaoUsuario.enum';

export interface Usuario {
  id?: number;

  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  senha?: string;

  dataNascimento?: Date;

  filialId: number;

  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;

  limiteLivros?: number;
  estaBloqueado?: boolean;

  funcao?: FuncaoUsuario;
  matriculaFuncionario?: string;

  ultimoAcesso?: Date;

  foto?: string;

  dataCriacao?: Date;
  dataUltimaAtualizacao?: Date;
}
