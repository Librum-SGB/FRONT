import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { environment } from '../../environments/environment';
import { FuncaoUsuario } from '../enum/funcaoUsuario.enum';
import { Usuario } from '../models/usuario.model';

interface PaginaUsuarios {
  content: Usuario[];
  number: number;
  totalPages: number;
}

export interface UsuarioCadastro {
  nome: string;
  email: string;
  senha: string;
  filialId: number;
  cpf?: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  /** Funcionários: função (sem ela, o backend cadastra como leitor) e matrícula. */
  funcao?: string;
  matriculaFuncionario?: string;
}

export interface UsuarioAtualizacao {
  nome: string;
  email: string;
  filialId: number;
  cpf?: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  limiteLivros?: number;
  /** Funcionários: reenviar a matrícula atual (o backend apaga o que não for enviado). */
  matriculaFuncionario?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  cadastrar(usuario: UsuarioCadastro): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  /** Leitores (função USUARIO). Por padrão só os ativos; `incluirInativos` traz todos. */
  listarAlunos(incluirInativos = false): Observable<Usuario[]> {
    return this.listarTodasAsPaginas(
      new HttpParams().set('funcao', 'USUARIO').set('ativo', incluirInativos ? 'todos' : 'true'),
    );
  }

  /** Funcionários (todas as funções exceto leitor), incluindo inativos. */
  listarFuncionarios(): Observable<Usuario[]> {
    return this.listarTodasAsPaginas(new HttpParams().set('ativo', 'todos')).pipe(
      map((usuarios) => usuarios.filter((u) => u.funcao && u.funcao !== FuncaoUsuario.USUARIO)),
    );
  }

  /** O backend devolve os usuários paginados; busca página por página e junta tudo. */
  private listarTodasAsPaginas(filtros: HttpParams): Observable<Usuario[]> {
    const params = filtros.set('size', '100');
    const carregarPagina = (numero: number) =>
      this.http.get<PaginaUsuarios>(this.apiUrl, {
        params: params.set('page', numero),
      });

    return carregarPagina(0).pipe(
      expand((pagina) =>
        pagina.number + 1 < pagina.totalPages
          ? carregarPagina(pagina.number + 1)
          : EMPTY,
      ),
      reduce((usuarios, pagina) => usuarios.concat(pagina.content), [] as Usuario[]),
    );
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, usuario: UsuarioAtualizacao): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  atualizarBloqueio(id: number, bloqueado: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/bloqueio`, { bloqueado });
  }

  /** Inativa (a conta deixa de entrar no sistema) ou reativa o usuário. */
  atualizarAtivacao(id: number, ativo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/ativacao`, { ativo });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
