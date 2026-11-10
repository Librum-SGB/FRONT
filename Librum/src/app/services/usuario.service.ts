import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, reduce } from 'rxjs';
import { environment } from '../../environments/environment';
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
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  cadastrar(usuario: UsuarioCadastro): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  listarAlunos(): Observable<Usuario[]> {
    const params = new HttpParams()
      .set('funcao', 'USUARIO')
      .set('ativo', 'true')
      .set('size', '100');

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

  atualizar(id: number, usuario: UsuarioAtualizacao): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
