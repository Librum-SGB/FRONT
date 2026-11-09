import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Emprestimo } from '../models/emprestimo.model';

@Injectable({ providedIn: 'root' })
export class EmprestimoService {
  private readonly apiUrl = `${environment.apiUrl}/emprestimos`;

  constructor(private readonly http: HttpClient) {}

  listarVisiveis(ativo?: boolean): Observable<Emprestimo[]> {
    const url = ativo == null ? `${this.apiUrl}/meus` : `${this.apiUrl}/meus?ativo=${ativo}`;
    return this.http.get<Emprestimo[]>(url);
  }

  listarPorUsuario(usuarioId: number): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(`${this.apiUrl}/usuarios/${usuarioId}?ativo=true`);
  }

  criarLote(emprestimo: {
    usuarioId: number;
    exemplarIds: number[];
    dataDevolucaoPrevista: string;
  }): Observable<Emprestimo[]> {
    return this.http.post<Emprestimo[]>(`${this.apiUrl}/lote`, emprestimo);
  }

  renovar(id: number): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${this.apiUrl}/${id}/renovacao`, {});
  }

  devolver(id: number): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${this.apiUrl}/${id}/devolucao`, {});
  }
}
