import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Filial } from '../models/filial.model';

@Injectable({ providedIn: 'root' })
export class FilialService {
  private readonly apiUrl = `${environment.apiUrl}/filiais`;

  constructor(private readonly http: HttpClient) {}

  listarAtivas(): Observable<Filial[]> {
    return this.http.get<Filial[]>(this.apiUrl, { params: { ativo: 'true' } });
  }
}
