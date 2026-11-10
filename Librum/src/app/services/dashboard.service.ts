import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Emprestimo } from '../models/emprestimo.model';

export interface DashboardResumo {
  alunosCadastrados: number;
  livrosNoAcervo: number;
  emprestimosAtivos: number;
  emprestimosAVencer: number;
  emAndamento: number;
  vencidos: number;
  emprestimos: Emprestimo[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  obterResumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${this.apiUrl}/resumo`);
  }
}
