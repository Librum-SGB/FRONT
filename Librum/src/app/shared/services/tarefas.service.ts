import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tarefa, TarefaRequest } from '../../models/tarefa.model';

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  private readonly apiUrl = `${environment.apiUrl}/tarefas`;

  constructor(private readonly http: HttpClient) {}

  findByUserId(userId: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/gestores/${userId}`);
  }

  create(tarefa: TarefaRequest): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  update(id: number, tarefa: TarefaRequest): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
