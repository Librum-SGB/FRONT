import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Filial, FilialRequest, FilialResponse } from '../models/filial.model';

@Injectable({ providedIn: 'root' })
export class FilialService {
  private readonly apiUrl = `${environment.apiUrl}/filiais`;
  private readonly alteracoes = new Subject<void>();
  readonly unidadesAlteradas$ = this.alteracoes.asObservable();

  constructor(private readonly http: HttpClient) {}

  listarAtivas(): Observable<Filial[]> {
    return this.http.get<Filial[]>(this.apiUrl, { params: { ativo: 'true' } });
  }

  listar(): Observable<FilialResponse[]> {
    return this.http.get<FilialResponse[]>(this.apiUrl);
  }

  criar(filial: FilialRequest): Observable<FilialResponse> {
    return this.http.post<FilialResponse>(this.apiUrl, filial).pipe(tap(() => this.alteracoes.next()));
  }
}
