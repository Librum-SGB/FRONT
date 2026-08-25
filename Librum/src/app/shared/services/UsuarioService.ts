import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario } from '../../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly baseUrl = '/api/usuarios';

  private usuarios: Usuario[] = [];

  constructor(private http: HttpClient) {}

  // ---------- Local (cache) ----------

  getById(id: number): Usuario | undefined {
    return this.usuarios.find((u) => u.id === id);
  }

  getAllLocal(filialId?: number): Usuario[] {
    return filialId ? this.usuarios.filter((u) => u.filialId === filialId) : this.usuarios;
  }

  // ---------- HTTP (CRUD) ----------

  listar(filialId?: number): Observable<Usuario[]> {
    let params = new HttpParams();

    if (filialId) {
      params = params.set('filialId', filialId);
    }

    return this.http.get<Usuario[]>(this.baseUrl, { params }).pipe(
      tap((usuarios) => {
        this.usuarios = usuarios;
      }),
    );
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`).pipe(
      tap((usuario) => {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.usuarios[index] = usuario;
        } else {
          this.usuarios.push(usuario);
        }
      }),
    );
  }

  criar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario).pipe(
      tap((criado) => {
        this.usuarios.push(criado);
      }),
    );
  }

  atualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario).pipe(
      tap((atualizado) => {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.usuarios[index] = atualizado;
        }
      }),
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.usuarios = this.usuarios.filter((u) => u.id !== id);
      }),
    );
  }

  // ---------- Ações específicas ----------

  bloquear(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/bloquear`, {}).pipe(
      tap((atualizado) => {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.usuarios[index] = atualizado;
        }
      }),
    );
  }

  desbloquear(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/desbloquear`, {}).pipe(
      tap((atualizado) => {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.usuarios[index] = atualizado;
        }
      }),
    );
  }

  uploadFoto(id: number, foto: File): Observable<Usuario> {
    const formData = new FormData();
    formData.append('foto', foto);

    return this.http.post<Usuario>(`${this.baseUrl}/${id}/foto`, formData).pipe(
      tap((atualizado) => {
        const index = this.usuarios.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.usuarios[index] = atualizado;
        }
      }),
    );
  }
}
