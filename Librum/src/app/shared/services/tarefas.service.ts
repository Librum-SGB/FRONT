import { Injectable } from '@angular/core';
import { prioridade } from '../../enum/prioridade.enum';
import { Tarefa } from '../../models/tarefa.model';

@Injectable({
  providedIn: 'root',
})
export class TarefaService {
  private tarefas: Tarefa[] = [
    {
      id: 1,
      gestorId: 101,
      descricao: 'Implementar login com JWT',
      prioridade: prioridade.ALTA,
      concluida: false,
      dataCriacao: new Date('2026-04-20'),
      dataUltimaAtualizacao: new Date('2026-04-24'),
    },
    {
      id: 2,
      gestorId: 101,
      descricao: 'Criar layout da dashboard',
      prioridade: prioridade.MEDIA,
      concluida: true,
      dataCriacao: new Date('2026-04-18'),
      dataUltimaAtualizacao: new Date('2026-04-22'),
    },
    {
      id: 3,
      gestorId: 102,
      descricao: 'Corrigir bug no filtro de busca',
      prioridade: prioridade.ALTA,
      concluida: false,
      dataCriacao: new Date('2026-04-23'),
      dataUltimaAtualizacao: new Date('2026-04-25'),
    },
  ];

  private nextId = 4;

  // 📥 GET - listar tarefas
  getTarefas(): Tarefa[] {
    return [...this.tarefas]; // evita alteração direta externa
  }

  // 📥 GET por ID (extra útil)
  getTarefaById(id: number): Tarefa | undefined {
    return this.tarefas.find((t) => t.id === id);
  }

  // ➕ POST - adicionar tarefa
  adicionarTarefa(tarefa: Tarefa): void {
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: this.nextId++,
      concluida: tarefa.concluida ?? false,
      dataCriacao: new Date(),
      dataUltimaAtualizacao: new Date(),
    };

    this.tarefas.push(novaTarefa);
  }

  // 🔁 PATCH - alternar conclusão
  alternarConclusao(id: number): void {
    const tarefa = this.tarefas.find((t) => t.id === id);

    if (!tarefa) return;

    tarefa.concluida = !tarefa.concluida;
    tarefa.dataUltimaAtualizacao = new Date();
  }

  // ✏️ atualizar descrição
  atualizarDescricao(id: number, descricao: string): void {
    const tarefa = this.tarefas.find((t) => t.id === id);

    if (!tarefa) return;

    tarefa.descricao = descricao;
    tarefa.dataUltimaAtualizacao = new Date();
  }

  // 🗑 remover tarefa (extra útil)
  removerTarefa(id: number): void {
    this.tarefas = this.tarefas.filter((t) => t.id !== id);
  }

  // 📊 contar concluídas (extra para dashboard)
  contarConcluidas(): number {
    return this.tarefas.filter((t) => t.concluida).length;
  }
}
