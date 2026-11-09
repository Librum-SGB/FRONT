import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

interface PaginaUsuarios {
  content: Usuario[];
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

    return this.http
      .get<PaginaUsuarios>(this.apiUrl, { params })
      .pipe(map((pagina) => pagina.content));
  }
}
