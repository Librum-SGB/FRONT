import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { prioridade } from '../../enum/prioridade.enum';
import { Tarefa } from '../../models/tarefa.model';

type StatusTarefaApi = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

interface TarefaApi {
  id: number;
  usuarioId: number;
  descricao: string;
  prioridade: prioridade;
  status: StatusTarefaApi;
  prazo?: string;
  dataCriacao?: string;
  dataUltimaAtualizacao?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  private readonly apiUrl = `${environment.apiUrl}/tarefas`;

  constructor(private readonly http: HttpClient) {}

  getMinhasTarefas(): Observable<Tarefa[]> {
    return this.http
      .get<TarefaApi[]>(`${this.apiUrl}/minhas`)
      .pipe(map((tarefas) => tarefas.map((tarefa) => this.mapTarefa(tarefa))));
  }

  adicionarTarefa(descricao: string): Observable<Tarefa> {
    return this.http
      .post<TarefaApi>(this.apiUrl, {
        descricao,
        prioridade: prioridade.MEDIA,
        status: 'PENDENTE',
      })
      .pipe(map((tarefa) => this.mapTarefa(tarefa)));
  }

  alternarConclusao(tarefa: Tarefa): Observable<Tarefa> {
    if (tarefa.id == null) {
      throw new Error('Não é possível atualizar uma tarefa sem identificador.');
    }

    return this.http
      .put<TarefaApi>(`${this.apiUrl}/${tarefa.id}`, {
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        status: tarefa.concluida ? 'PENDENTE' : 'CONCLUIDA',
        prazo: tarefa.prazo,
      })
      .pipe(map((atualizada) => this.mapTarefa(atualizada)));
  }

  removerTarefa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapTarefa(tarefa: TarefaApi): Tarefa {
    return {
      id: tarefa.id,
      usuarioId: tarefa.usuarioId,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      status: tarefa.status,
      concluida: tarefa.status === 'CONCLUIDA',
      prazo: tarefa.prazo,
      dataCriacao: tarefa.dataCriacao,
      dataUltimaAtualizacao: tarefa.dataUltimaAtualizacao,
    };
  }
}
